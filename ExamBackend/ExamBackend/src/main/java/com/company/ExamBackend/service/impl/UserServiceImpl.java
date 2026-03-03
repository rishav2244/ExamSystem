package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.config.JwtUtils;
import com.company.ExamBackend.dto.*;
import com.company.ExamBackend.exception.*;
import com.company.ExamBackend.mapper.UserMapper;
import com.company.ExamBackend.model.Users;
import com.company.ExamBackend.repository.UserRepository;
import com.company.ExamBackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Value("${app.security.default-candidate-password:test}")
    private String defaultCandidatePassword;

    @Value("${app.security.candidate-password-max-length:40}")
    private int passwordMaxLength;

    @Transactional
    @Override
    public UserResponseDTO candidateRegisterAttempt(CandidateRegisterRequestDTO dto) {
        ensureEmailUnique(dto.getEmail());
        Users user = buildUserEntity(dto.getEmail(), dto.getName(), "CANDIDATE", dto.getPassword(), true);
        return userMapper.toUserResponse(userRepository.save(user));
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

    @Override
    public UserResponseDTO loginAttempt(LoginRequestDTO loginRequestDTO) {
        Users user = findUserByEmail(loginRequestDTO.getEmail());
        verifyCurrentPassword(loginRequestDTO.getPassword(), user.getPassword());
        return userMapper.toUserResponse(user);
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
    public String getToken(String email) { return jwtUtils.generateToken(email); }

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
}