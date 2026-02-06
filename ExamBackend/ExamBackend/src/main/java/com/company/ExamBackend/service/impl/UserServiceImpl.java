package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.config.JwtUtils;
import com.company.ExamBackend.dto.*;
import com.company.ExamBackend.exception.EmailExistsException;
import com.company.ExamBackend.exception.EmailNotFoundException;
import com.company.ExamBackend.exception.PasswordMismatchException;
import com.company.ExamBackend.exception.UserNotFoundException;
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

    @Value("${app.security.default-candidate-password}")
    private String defaultCandidatePassword;

    @Transactional
    @Override
    public UserResponseDTO registerAttempt(RegisterRequestDTO registerRequestDTO) {
        try {
            Users user = userMapper.toUser(registerRequestDTO); //We create a Users object from
            //our DTO. This can now hold the encrypted password, manually decided for admin
            //and auto-set for user.
            user.setPassword(determineAndEncodePassword(registerRequestDTO));//Our function will
            //set the password for this Users object.
            Users savedUser = userRepository.save(user);
            return userMapper.toUserResponse(savedUser);
        } catch (DataIntegrityViolationException e) {//Uses the unique=true of Users object to
            //"automatically" prevent duplicate users over emails.
            throw new EmailExistsException("Email already exists.");
        }
    }

    //Method to set password. Auto password from our .env file for CANDIDATE, frontend-sent
    //password for ADMIN.
    private String determineAndEncodePassword(RegisterRequestDTO dto) {
        String rawPassword = "CANDIDATE".equalsIgnoreCase(dto.getRole())
                ? defaultCandidatePassword
                : dto.getPassword();
        return passwordEncoder.encode(rawPassword);
    }

    //Yeah, login service.
    @Override
    public UserResponseDTO loginAttempt(LoginRequestDTO loginRequestDTO) {
        //We fetch User from our database based on email.
        Users user = userRepository.findByEmail(loginRequestDTO.getEmail())
                .orElseThrow(() -> new EmailNotFoundException("Email not found."));

        //User our passwordEncoder to match hashes of stored and sent passwords.
        if (!passwordEncoder.matches(loginRequestDTO.getPassword(), user.getPassword())) {
            throw new PasswordMismatchException("Invalid credentials");
        }

        //Returns name, email, role.
        return userMapper.toUserResponse(user);
    }

    @Transactional
    @Override
    public void resetPassword(PasswordResetDTO passwordResetDTO) {
        Users user = userRepository.findByEmail(passwordResetDTO.getEmail())
                .orElseThrow(() -> new EmailNotFoundException("User not found with email: " + passwordResetDTO.getEmail()));

        if (!passwordEncoder.matches(passwordResetDTO.getOldPassword(), user.getPassword())) {
            throw new PasswordMismatchException("The old password provided is incorrect.");
        }

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
        return userMapper.
                toUserHeavy(userRepository.
                findById(id).
                orElseThrow(() -> new UserNotFoundException("User not found.")));
    }
}
