package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.config.JwtUtils;
import com.company.ExamBackend.dto.*;
import com.company.ExamBackend.exception.*;
import com.company.ExamBackend.mapper.UserMapper;
import com.company.ExamBackend.model.PendingRegistration;
import com.company.ExamBackend.model.RefreshToken;
import com.company.ExamBackend.model.Users;
import com.company.ExamBackend.repository.PendingRegistrationRepository;
import com.company.ExamBackend.repository.RefreshTokenRepository;
import com.company.ExamBackend.repository.UserRepository;
import com.company.ExamBackend.service.EmailService;
import com.company.ExamBackend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PendingRegistrationRepository pendingRegistrationRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    private final UserMapper userMapper;
    private final EmailService emailService;

    private final PasswordEncoder passwordEncoder;

    private final JwtUtils jwtUtils;

    @Value("${app.security.default-candidate-password:test}")
    private String defaultCandidatePassword;

    @Value("${app.security.candidate-password-max-length:40}")
    private int passwordMaxLength;

    @Value("${app.registration.max-attempts:6}")
    private int maxAttempts;

    @Value("${app.registration.lockout-message:Account locked due to too many attempts.}")
    private String lockoutMessage;

    @Value("${app.registration.otp-ttl:600000}")
    private long otpTtl;

    @Value("${app.registration.cooldown-duration:3600000}")
    private long cooldownDuration;

    @Value("${app.registration.resend-delay:60000}")
    private long resendDelay;

    @Transactional
    @Override
    public RegistrationResponseDTO candidateRegisterAttempt(CandidateRegisterRequestDTO dto) {
        log.info("Starting registration attempt for email: {}", dto.getEmail());
        ensureEmailUnique(dto.getEmail());
        String email = dto.getEmail().toLowerCase().trim();

        PendingRegistration pending = getOrCreatePendingRegistration(email);
        validateCoolDown(pending);

        String rawOtp = generateNumericOtp();
        updatePendingDetails(pending, dto, rawOtp);

        pendingRegistrationRepository.save(pending);
        emailService.sendOtp(email, rawOtp);

        return new RegistrationResponseDTO(
                "OTP sent to " + email,
                otpTtl / 1000,   // Expiry timer for FE
                resendDelay / 1000, // Resend button delay for FE
                maxAttempts
        );
    }

    @Transactional
    @Override
    public void logout(String email) {
        Users user = findUserByEmail(email);
        refreshTokenRepository.deleteByUser(user);
        log.info("User {} has been logged out and refresh token revoked.", email);
    }

    @Transactional(noRollbackFor = {PasswordMismatchException.class, InvalidActionException.class})
    @Override
    public UserResponseDTO verifyRegistration(VerifyOtpRequestDTO dto) {
        log.info("Verifying OTP for email: {}", dto.getEmail());
        String email = dto.getEmail().toLowerCase().trim();
        PendingRegistration pending = findPendingOrThrow(email);

        validatePendingState(pending);

        log.debug("Comparing provided OTP with stored hash for {}", email);
        verifyOtpAndHandleAttempts(pending, dto.getOtp());

        log.info("OTP verified. Promoting {} to full user.", email);
        Users newUser = userMapper.pendingToUser(pending);
        Users savedUser = userRepository.save(newUser);
        pendingRegistrationRepository.delete(pending);

        return userMapper.toUserResponse(savedUser);
    }

    @Override
    public BulkRegistrationSummaryDTO adminRegisterAttempt(AdminRegisterRequestDTO dto) {
        List<AdminRegisterRequestDTO.IndividualRegistrationDTO> requestedUsers = dto.getUsers();
        List<BulkRegistrationSummaryDTO.RegistrationError> errors = new java.util.ArrayList<>();
        List<Users> usersToSave = new java.util.ArrayList<>();
        java.util.Set<String> processedInBatch = new java.util.HashSet<>();

        List<String> existingInDb = getExistingEmails(requestedUsers);

        for (var req : requestedUsers) {
            processIndividualRegistration(req, existingInDb, processedInBatch, usersToSave, errors);
        }

        if (!usersToSave.isEmpty()) {
            userRepository.saveAll(usersToSave);
        }

        return new BulkRegistrationSummaryDTO(requestedUsers.size(), usersToSave.size(), errors.size(), errors);
    }

    @Transactional
    @Override
    public ResendResponseDTO resendOtp(String email) {
        String normalizedEmail = email.toLowerCase().trim();
        PendingRegistration pending = findPendingOrThrow(normalizedEmail);

        validateCoolDown(pending);

        // Rate Limit: (Current time) vs (Last Send Time)
        // Last Send = validUntil - otpTtl
        Instant lastGenerated = pending.getValidUntil().minusMillis(otpTtl);
        Instant now = Instant.now();
        long millisSinceLast = java.time.Duration.between(lastGenerated, now).toMillis();

        if (millisSinceLast < resendDelay) {
            long remainingSeconds = (resendDelay - millisSinceLast) / 1000;
            throw new InvalidActionException("Please wait " + remainingSeconds + " seconds before resending.");
        }

        String newOtp = generateNumericOtp();
        pending.setOtp(passwordEncoder.encode(newOtp));
        pending.setValidUntil(now.plusMillis(otpTtl));
        // We do NOT reset attempts here to prevent brute force resetting

        pendingRegistrationRepository.save(pending);
        emailService.sendOtp(normalizedEmail, newOtp);

        return new ResendResponseDTO(true, "A new OTP has been sent.", resendDelay / 1000);
    }

    @Transactional
    @Override
    public LoginResponseDTO loginAttempt(LoginRequestDTO loginRequestDTO) {
        Users user = findUserByEmail(loginRequestDTO.getEmail());
        verifyCurrentPassword(loginRequestDTO.getPassword(), user.getPassword());

        TokenResponseDTO tokens = createTokens(user, true);

        return userMapper.toLoginResponse(user, tokens);
    }

    @Transactional
    @Override
    public void resetPassword(String email, PasswordResetDTO passwordResetDTO) {
        validatePasswordLength(passwordResetDTO.getNewPassword());
        validatePasswordChange(passwordResetDTO.getOldPassword(), passwordResetDTO.getNewPassword());
        Users user = findUserByEmail(email);
        verifyCurrentPassword(passwordResetDTO.getOldPassword(), user.getPassword());
        user.setPassword(passwordEncoder.encode(passwordResetDTO.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public List<UserHeavyDTO> getCandidates() {
        return userRepository.findAllByRole("CANDIDATE").stream().map(userMapper::toUserHeavy).toList();
    }

    @Override
    public List<UserHeavyDTO> getUsers() {
        return userRepository.findAll().stream().map(userMapper::toUserHeavy).toList();
    }

    @Override
    public UserHeavyDTO getUserById(String id) { return userMapper.toUserHeavy(findUserById(id)); }

    // ======================================================================================
    // Core Logic Helpers
    // ======================================================================================

    private void processIndividualRegistration(
            AdminRegisterRequestDTO.IndividualRegistrationDTO req,
            List<String> existingInDb,
            java.util.Set<String> processedInBatch,
            List<Users> usersToSave,
            List<BulkRegistrationSummaryDTO.RegistrationError> errors) {

        try {
            String email = validateAndNormalizeEmail(req.getEmail());
            checkCollisions(email, existingInDb, processedInBatch);

            Users userEntity = buildUserEntity(email, req.getName(), req.getRole(), req.getPassword(),false);
            usersToSave.add(userEntity);
            processedInBatch.add(email);
        } catch (Exception e) {
            errors.add(new BulkRegistrationSummaryDTO.RegistrationError(
                    req.getEmail() != null ? req.getEmail() : "MISSING_EMAIL",
                    e.getMessage()
            ));
        }
    }

    private String validateAndNormalizeEmail(String email) {
        if (email == null || email.isBlank()) throw new InvalidActionException("Email field is blank");
        return email.toLowerCase().trim();
    }

    private void checkCollisions(String email, List<String> existingInDb, java.util.Set<String> processed) {
        if (existingInDb.contains(email)) throw new EmailExistsException("Email already exists in database");
        if (processed.contains(email)) throw new InvalidActionException("Duplicate email found in the upload file");
    }

    private List<String> getExistingEmails(List<AdminRegisterRequestDTO.IndividualRegistrationDTO> requestedUsers) {
        List<String> emailsToCheck = requestedUsers.stream()
                .filter(u -> u.getEmail() != null)
                .map(u -> u.getEmail().toLowerCase().trim())
                .toList();

        return userRepository.findAllByEmailIn(emailsToCheck).stream()
                .map(u -> u.getEmail().toLowerCase())
                .toList();
    }

    private Users buildUserEntity(String email, String name, String role, String rawPassword, boolean isCandidateSide) {
        if (role == null || role.isBlank()) throw new InvalidActionException("Role is required.");

        Users user = new Users();
        user.setEmail(email);
        user.setName(name);
        user.setRole(role.toUpperCase());
        user.setPassword(processPassword(user.getRole(), rawPassword, isCandidateSide));
        return user;
    }

    private String processPassword(String role, String rawPassword, boolean isCandidateSide) {
        if ("CANDIDATE".equalsIgnoreCase(role) && !isCandidateSide) return passwordEncoder.encode(defaultCandidatePassword);

        if (rawPassword == null || rawPassword.isBlank()) {
            throw new InvalidActionException("Password is required for role: " + role);
        }
        validatePasswordLength(rawPassword);
        return passwordEncoder.encode(rawPassword);
    }

    private PendingRegistration getOrCreatePendingRegistration(String email) {
        return pendingRegistrationRepository.findByEmail(email)
                .orElseGet(() -> {
                    PendingRegistration p = new PendingRegistration();
                    p.setEmail(email);
                    return p;
                });
    }

    private void validateCoolDown(PendingRegistration pending) {
        if (pending.getValidUntil() != null &&
                !pending.isValid() &&
                pending.getValidUntil().isAfter(java.time.Instant.now())) {

            log.warn("Registration blocked by cooldown for {}. Lock expires at: {}",
                    pending.getEmail(), pending.getValidUntil());
            throw new InvalidActionException(lockoutMessage);
        }
    }

    private void updatePendingDetails(PendingRegistration pending, CandidateRegisterRequestDTO dto, String rawOtp) {
        pending.setName(dto.getName());
        pending.setPassword(passwordEncoder.encode(dto.getPassword()));
        pending.setOtp(passwordEncoder.encode(rawOtp));
        pending.setAttempts(0); // Reset attempts on new OTP request
        pending.setValid(true);
        pending.setValidUntil(java.time.Instant.now().plusMillis(otpTtl));
    }

    private void verifyOtpAndHandleAttempts(PendingRegistration pending, String rawOtp) {
        if (!passwordEncoder.matches(rawOtp, pending.getOtp())) {
            int currentAttempts = pending.getAttempts() + 1;
            pending.setAttempts(currentAttempts);

            log.warn("Incorrect OTP attempt #{} for {}", currentAttempts, pending.getEmail());

            if (currentAttempts >= maxAttempts) {
                log.error("User {} reached max attempts. Locking account.", pending.getEmail());
                lockOutUser(pending);
                throw new InvalidActionException(lockoutMessage);
            }

            pendingRegistrationRepository.save(pending);
            throw new PasswordMismatchException(
                    String.format("Invalid OTP. Attempts remaining: %d", (maxAttempts - currentAttempts))
            );
        }
        log.info("OTP match confirmed for {}", pending.getEmail());
    }

    @Override
    @Transactional
    public LoginResponseDTO refreshAccessToken(String refreshTokenRequest) {
        RefreshToken rt = refreshTokenRepository.findByToken(refreshTokenRequest)
                .orElseThrow(() -> new InvalidTokenException("Invalid Refresh Token"));

        if (rt.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(rt);
            throw new TokenExpiredException("Refresh token expired. Please login again.");
        }

        TokenResponseDTO tokens = createTokens(rt.getUser(), false);
        return userMapper.toLoginResponse(rt.getUser(), tokens);
    }

    private TokenResponseDTO createTokens(Users user, boolean resetExpiry) {
        String access = jwtUtils.generateAccessToken(user.getEmail());
        String refresh = jwtUtils.generateRefreshToken(user.getEmail());

        user.setTokenLastRefreshed(Instant.now());
        userRepository.save(user);

        RefreshToken refreshToken = refreshTokenRepository.findByUser(user)
                .orElse(new RefreshToken());

        if (refreshToken.getId() == null || resetExpiry) {
            refreshToken.setUser(user);
            refreshToken.setExpiryDate(Instant.now().plusMillis(jwtUtils.getRefreshExpiration()));
        }

        refreshToken.setToken(refresh);
        refreshTokenRepository.save(refreshToken);

        return new TokenResponseDTO(access, refresh, "Bearer");
    }

    // ======================================================================================
    // Small Utility Helpers
    // ======================================================================================

    private void ensureEmailUnique(String email) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new EmailExistsException("Email " + email + " is already registered.");
        }
    }

    private Users findUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new EmailNotFoundException("User not found."));
    }

    private Users findUserById(String id) {
        return userRepository.findById(id).orElseThrow(() -> new UserNotFoundException("User not found."));
    }

    private void validatePasswordChange(String oldPass, String newPass) {
        if (newPass.equals(oldPass)) throw new InvalidActionException("New password matches current password.");
    }

    private void validatePasswordLength(String password) {
        if (password != null && password.length() > passwordMaxLength) {
            throw new InvalidActionException("Password exceeds " + passwordMaxLength + " characters.");
        }
    }

    private void verifyCurrentPassword(String rawPassword, String encodedPassword) {
        if (!passwordEncoder.matches(rawPassword, encodedPassword)) {
            throw new PasswordMismatchException("Incorrect password.");
        }
    }

    private PendingRegistration findPendingOrThrow(String email) {
        return pendingRegistrationRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidActionException("No registration attempt found."));
    }

    private void validatePendingState(PendingRegistration pending) {
        Instant now = java.time.Instant.now();

        // 1. Check Lockout
        if (!pending.isValid() && pending.getValidUntil().isAfter(now)) {
            throw new InvalidActionException("Account locked. Please try again later.");
        }

        // 2. Check Expiry
        if (pending.getValidUntil().isBefore(now)) {
            log.warn("OTP expired for: {}. Cleaning up record.", pending.getEmail());
            // CRITICAL: Delete the expired record so they can try candidateRegisterAttempt again
            pendingRegistrationRepository.delete(pending);
            throw new InvalidActionException("OTP has expired. Please register again.");
        }
    }

    private void lockOutUser(PendingRegistration pending) {
        pending.setValid(false);
        pending.setValidUntil(java.time.Instant.now().plusMillis(cooldownDuration));
        pendingRegistrationRepository.save(pending);
    }

    // 6-digit OTP
    private String generateNumericOtp() {
        return String.valueOf(new java.util.Random().nextInt(900000) + 100000);
    }
}