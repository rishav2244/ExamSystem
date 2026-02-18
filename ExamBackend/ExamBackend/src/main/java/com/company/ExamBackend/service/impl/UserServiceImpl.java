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
import org.springframework.dao.DataIntegrityViolationException;
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
    public UserResponseDTO registerAttempt(RegisterRequestDTO registerRequestDTO) {
        try {
            Users user = createNewUserEntity(registerRequestDTO);
            Users savedUser = userRepository.save(user);
            return userMapper.toUserResponse(savedUser);
        } catch (DataIntegrityViolationException e) {
            throw new EmailExistsException("Email " + registerRequestDTO.getEmail() + " already exists.");
        }
    }

    //Yeah, login service.
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

    //Used for generating the token to be sent upon login.
    @Override
    public String getToken(String email) {
        return jwtUtils.generateToken(email);
    }

    //Gets all users of type candidate.
    @Override
    public List<UserHeavyDTO> getCandidates() {
        return userRepository.findAllByRole("CANDIDATE")
                .stream()
                .map(userMapper::toUserHeavy)
                .toList();
    }

    //Lists all users regardless of role.
    @Override
    public List<UserHeavyDTO> getUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toUserHeavy)
                .toList();
    }

    //Gets info about specific users. Right now nothing much to get.
    @Override
    public UserHeavyDTO getUserById(String id) {
        return userMapper.toUserHeavy(findUserById(id));
    }

    // ======================================================================================
    // Helper methods
    // ======================================================================================

    private Users findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EmailNotFoundException("User with email " + email + " not found."));
    }

    private Users findUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User with ID " + id + " not found."));
    }

    //Separate function to handle "redundant" password change.
    private void validatePasswordChange(String oldPass, String newPass) {
        if (newPass.equals(oldPass)) {
            throw new InvalidActionException("New password cannot be the same as the current password.");
        }
    }

    //Method to set password. Auto password from our .env file for CANDIDATE, frontend-sent
    //password for ADMIN.
    private String determineAndEncodePassword(RegisterRequestDTO dto) {
        boolean isCandidate = "CANDIDATE".equalsIgnoreCase(dto.getRole());

        if (isCandidate) {
            return passwordEncoder.encode(defaultCandidatePassword);
        }

        // For ADMIN, password existence needs to be checked since validation for it is not possible
        // on DTO level.
        if (dto.getPassword() == null || dto.getPassword().isBlank()) {
            throw new InvalidActionException("Password is required for non-candidate roles.");
        }

        validatePasswordLength(dto.getPassword());
        return passwordEncoder.encode(dto.getPassword());
    }

    //Helps check password length
    private void validatePasswordLength(String password) {
        if (password != null && password.length() > passwordMaxLength) {
            throw new InvalidActionException("Password cannot exceed " + passwordMaxLength + " characters.");
        }
    }

    //Check if password exists in database in the first place.
    private void verifyCurrentPassword(String rawPassword, String encodedPassword) {
        if (!passwordEncoder.matches(rawPassword, encodedPassword)) {
            throw new PasswordMismatchException("The password provided is incorrect.");
        }
    }

    //User registration
    private Users createNewUserEntity(RegisterRequestDTO dto) {
        Users user = userMapper.toUser(dto);
        user.setPassword(determineAndEncodePassword(dto));
        return user;
    }
}
