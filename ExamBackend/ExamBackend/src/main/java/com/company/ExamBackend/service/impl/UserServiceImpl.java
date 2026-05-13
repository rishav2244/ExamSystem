package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.config.JwtUtils;
import com.company.ExamBackend.dto.*;
import com.company.ExamBackend.exception.*;
import com.company.ExamBackend.mapper.UserMapper;
import com.company.ExamBackend.model.PasswordResetToken;
import com.company.ExamBackend.model.PendingRegistration;
import com.company.ExamBackend.model.RefreshToken;
import com.company.ExamBackend.model.Users;
import com.company.ExamBackend.repository.PasswordResetTokenRepository;
import com.company.ExamBackend.repository.PendingRegistrationRepository;
import com.company.ExamBackend.repository.RefreshTokenRepository;
import com.company.ExamBackend.repository.UserRepository;
import com.company.ExamBackend.service.EmailService;
import com.company.ExamBackend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PendingRegistrationRepository pendingRegistrationRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    private final UserMapper userMapper;
    private final EmailService emailService;

    private final PasswordEncoder passwordEncoder;

    private final JwtUtils jwtUtils;

    @Value("${app.security.default-candidate-password:test}")
    private String defaultCandidatePassword;

    @Value("${app.security.candidate-password-max-length:40}")
    private int passwordMaxLength;

    @Value("${app.registration.max-attempts:6}")
    private int registrationMaxAttempts;

    @Value("${app.forgot-password.max-attempts:6}")
    private int forgotPwMaxAttempts;

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
        emailService.sendRegistrationOtp(email, rawOtp);

        return new RegistrationResponseDTO(
                "OTP sent to " + email,
                otpTtl / 1000,   // Expiry timer for FE
                resendDelay / 1000, // Resend button delay for FE
                registrationMaxAttempts
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
        emailService.sendRegistrationOtp(normalizedEmail, newOtp);

        return new ResendResponseDTO(true, "A new OTP has been sent.", resendDelay / 1000);
    }

    @Transactional
    @Override
    public ResendResponseDTO resendForgotPasswordOtp(ForgotPasswordDTO dto) {
        String email = dto.getEmail().toLowerCase().trim();
        log.info("Resend password OTP requested for: {}", email);

        // 1. Check if user exists (to prevent sending emails to non-existent users)
        Optional<Users> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            // 2. Find existing token
            Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository.findByEmail(email);

            if (tokenOpt.isPresent()) {
                PasswordResetToken token = tokenOpt.get();

                // 3. Check Cooldown (Lockout from too many wrong guesses)
                if (token.getCooldownUntil() != null && token.getCooldownUntil().isAfter(Instant.now())) {
                    log.warn("Resend blocked: User {} is currently locked out.", email);
                    return new ResendResponseDTO(true, "If an account exists, a new OTP has been sent.", resendDelay / 1000);
                }

                // 4. Rate Limit (Preventing button spamming)
                Instant lastGenerated = token.getExpiryDate().minusMillis(otpTtl);
                long millisSinceLast = java.time.Duration.between(lastGenerated, Instant.now()).toMillis();

                if (millisSinceLast < resendDelay) {
                    // We can throw an exception here because "Too many requests" doesn't leak
                    // account existence (it just says "Stop clicking so fast")
                    long remainingSeconds = (resendDelay - millisSinceLast) / 1000;
                    throw new InvalidActionException("Please wait " + remainingSeconds + " seconds.");
                }

                // 5. Refresh and Send
                String newOtp = generateNumericOtp();
                token.setOtp(passwordEncoder.encode(newOtp));
                token.setExpiryDate(Instant.now().plusMillis(otpTtl));
                passwordResetTokenRepository.save(token);

                emailService.sendForgotPasswordOtp(email, newOtp);
            } else {
                // No token found? Treat as a fresh forgot-password request
                forgotPassword(dto);
            }
        } else {
            log.info("Resend requested for non-existent email: {}. Ignored silently.", email);
        }

        // Always return success to the UI
        return new ResendResponseDTO(true, "If an account exists, a new OTP has been sent.", resendDelay / 1000);
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

    @Transactional
    @Override
    public RegistrationResponseDTO forgotPassword(ForgotPasswordDTO forgotPasswordDTO) {
        String email = forgotPasswordDTO.getEmail().toLowerCase().trim();
        log.info("Password reset requested for email: {}", email);

        // 1. Find the user
        Optional<Users> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            Users user = userOpt.get();

            // 2. Reuse logic to check if they are currently locked out
            PasswordResetToken existingToken = passwordResetTokenRepository.findByEmail(user.getEmail()).orElse(null);

            if (existingToken != null) {
                // Check Cooldown
                if (existingToken.getCooldownUntil() != null &&
                        existingToken.getCooldownUntil().isAfter(Instant.now())) {
                    log.warn("Reset blocked by cooldown for user: {}", email);
                    // Return generic DTO even if blocked to prevent enumeration
                    return buildResetResponse(email);
                }
                // Clear old token to issue a fresh one
                passwordResetTokenRepository.delete(existingToken);
            }

            // 3. Generate and Save new Token
            String rawOtp = generateNumericOtp();
            PasswordResetToken newToken = new PasswordResetToken();
            newToken.setEmail(user.getEmail());
            newToken.setOtp(passwordEncoder.encode(rawOtp));
            newToken.setExpiryDate(Instant.now().plusMillis(otpTtl));
            newToken.setAttempts(0);
            newToken.setUsed(false);

            passwordResetTokenRepository.save(newToken);

            // 4. Send Email
            emailService.sendForgotPasswordOtp(email, rawOtp);
            log.info("Password reset OTP sent to existing user: {}", email);
        } else {
            log.info("Password reset requested for non-existent email: {}. No action taken.", email);
        }

        // Always return the DTO with generic message
        return buildResetResponse(email);
    }

    @Transactional(noRollbackFor = {PasswordMismatchException.class, InvalidActionException.class})
    @Override
    public ResetAttemptResponseDTO verifyAndResetPassword(ResetPasswordVerifyDTO dto) {
        String email = dto.getEmail().toLowerCase().trim();
        log.info("Attempting password reset verification for: {}", email);

        // 1. Find the token by email string
        PasswordResetToken token = passwordResetTokenRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidActionException("Invalid request or OTP expired."));

        // 2. Validate state (Expiry & Cooldown)
        validateResetTokenState(token);

        // 3. Verify OTP
        if (!passwordEncoder.matches(dto.getOtp(), token.getOtp())) {
            handleFailedResetAttempt(token);
            // This is where we return the DTO that the user sees
//            throw new PasswordMismatchException("Invalid OTP.");
            return userMapper.toResetAttemptResponse(
                    false,
                    Math.max(0,(forgotPwMaxAttempts - token.getAttempts())));
        }

        // 4. OTP is correct - Now check if the user actually exists to perform the update
        Optional<Users> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            Users user = userOpt.get();
            validatePasswordLength(dto.getPassword());

            user.setPassword(passwordEncoder.encode(dto.getPassword()));
            user.setTokenLastRefreshed(Instant.now()); // Invalidate existing sessions
            userRepository.save(user);
            log.info("Password successfully reset for user: {}", email);
        } else {
            // If user doesn't exist, we do nothing but we DON'T tell the frontend.
            log.warn("Valid OTP submitted for non-existent email: {}. No update performed.", email);
        }

        // 5. Cleanup
        passwordResetTokenRepository.delete(token);
        return userMapper.toResetAttemptResponse(true,0);
    }

    @Override
    public Page<UserHeavyDTO> getCandidates(Pageable pageable) {
        return userRepository.findAllByRole("CANDIDATE", pageable).map(userMapper::toUserHeavy);
    }

    @Override
    public Page<UserHeavyDTO> getUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toUserHeavy);
    }

    @Override
    public Page<UserHeavyDTO> searchUsers(
            UserSearchDTO searchDTO,
            int size,
            int page,
            String sortBy) {

        Sort sort = Sort.by(Sort.Direction.ASC, "id");
        if(sortBy.equals("name") || sortBy.equals("email") || sortBy.equals("role"))
        {
            sort = Sort.by(Sort.Direction.ASC, sortBy);
        }
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Users> userPage = userRepository.findUserByQuery(
                searchDTO.getSearchQuery(),
                pageable
        );

        return userPage.map(userMapper::toUserHeavy);
    }

    @Override
    public Page<UserHeavyDTO> searchCandidates(
            UserSearchDTO searchDTO,
            int size,
            int page,
            String sortBy) {

        Sort sort = Sort.by(Sort.Direction.ASC, "id");
        if(sortBy.equals("name") || sortBy.equals("email") || sortBy.equals("role"))
        {
            sort = Sort.by(Sort.Direction.ASC, sortBy);
        }
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Users> userPage = userRepository.findCandidateByQuery(
                searchDTO.getSearchQuery(),
                pageable
        );

        return userPage.map(userMapper::toUserHeavy);
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
        if (email == null || email.isBlank()) {
            throw new InvalidActionException("Email field is blank");
        }

        String cleanEmail = email.toLowerCase().trim();

        if (isInvalidEmailFormat(cleanEmail)) {
            throw new InvalidActionException("Invalid email format");
        }

        return cleanEmail;
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

            if (currentAttempts >= registrationMaxAttempts) {
                log.error("User {} reached max attempts. Locking account.", pending.getEmail());
                lockOutUser(pending);
                throw new InvalidActionException(lockoutMessage);
            }

            pendingRegistrationRepository.save(pending);
            throw new PasswordMismatchException(
                    String.format("Invalid OTP. Attempts remaining: %d", (registrationMaxAttempts - currentAttempts))
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

    private boolean isInvalidEmailFormat(String email) {
        // Standard basic regex
        String regex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        return email == null || !email.matches(regex);
    }

    private void validateResetTokenState(PasswordResetToken token) {
        Instant now = Instant.now();

        if (token.getCooldownUntil() != null && token.getCooldownUntil().isAfter(now)) {
            throw new InvalidActionException("Too many failed attempts. Please try again later.");
        }

        if (token.getExpiryDate().isBefore(now)) {
            passwordResetTokenRepository.delete(token);
            throw new InvalidActionException("OTP has expired. Please request a new one.");
        }
    }

    private void handleFailedResetAttempt(PasswordResetToken token) {
        int currentAttempts = token.getAttempts() + 1;
        token.setAttempts(currentAttempts);

        if (currentAttempts >= forgotPwMaxAttempts) {
            token.setCooldownUntil(Instant.now().plusMillis(cooldownDuration));
            log.warn("Email {} locked out of password reset due to max attempts.", token.getEmail());
        }

        passwordResetTokenRepository.save(token);
    }
    private RegistrationResponseDTO buildResetResponse(String email) {
        return new RegistrationResponseDTO(
                "If an account exists, an OTP has been sent to " + email,
                otpTtl / 1000,
                resendDelay / 1000,
                forgotPwMaxAttempts
        );
    }

}