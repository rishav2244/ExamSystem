package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.config.JwtUtils;
import com.company.ExamBackend.dto.LoginRequestDTO;
import com.company.ExamBackend.dto.RegisterRequestDTO;
import com.company.ExamBackend.dto.UserHeavyDTO;
import com.company.ExamBackend.dto.UserResponseDTO;
import com.company.ExamBackend.exception.EmailExistsException;
import com.company.ExamBackend.exception.EmailNotFoundException;
import com.company.ExamBackend.exception.PasswordMismatchException;
import com.company.ExamBackend.exception.UserNotFoundException;
import com.company.ExamBackend.mapper.UserMapper;
import com.company.ExamBackend.model.Users;
import com.company.ExamBackend.repository.UserRepository;
import com.company.ExamBackend.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Transactional
    @Override
    public UserResponseDTO registerAttempt(RegisterRequestDTO registerRequestDTO) {
        try {
            Users user = userMapper.toUser(registerRequestDTO);
            user.setPassword(passwordEncoder.encode(registerRequestDTO.getPassword()));

            Users savedUser = userRepository.save(user);
            return userMapper.toUserResponse(savedUser);
        } catch (DataIntegrityViolationException e) {
            throw new EmailExistsException("Email already exists.");
        }
    }

    @Override
    public UserResponseDTO loginAttempt(LoginRequestDTO loginRequestDTO) {
        Users user = userRepository.findByEmail(loginRequestDTO.getEmail())
                .orElseThrow(() -> new EmailNotFoundException("Email not found."));

        if (!passwordEncoder.matches(loginRequestDTO.getPassword(), user.getPassword())) {
            throw new PasswordMismatchException("Invalid credentials");
        }

        return userMapper.toUserResponse(user);
    }

    @Override
    public String getToken(String email) {
        return jwtUtils.generateToken(email);
    }

    @Override
    public List<UserHeavyDTO> getCandidates() {
        return userRepository.findAllByRole("CANDIDATE")
                .stream()
                .map(userMapper::toUserHeavy)
                .toList();
    }

    @Override
    public List<UserHeavyDTO> getUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toUserHeavy)
                .toList();
    }

    @Override
    public UserHeavyDTO getUserById(String id) {
        return userMapper.
                toUserHeavy(userRepository.
                findById(id).
                orElseThrow(() -> new UserNotFoundException("User not found.")));
    }
}
