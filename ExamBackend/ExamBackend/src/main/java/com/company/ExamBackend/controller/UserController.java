package com.company.ExamBackend.controller;

import com.company.ExamBackend.dto.LoginRequestDTO;
import com.company.ExamBackend.dto.RegisterRequestDTO;
import com.company.ExamBackend.dto.UserResponseDTO;
import com.company.ExamBackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/register")
    public UserResponseDTO userRegister(@RequestBody RegisterRequestDTO registerRequestDTO) {
        return userService.registerAttempt(registerRequestDTO);
    }

    @PostMapping("/login")
    public UserResponseDTO userLogin(@RequestBody LoginRequestDTO loginRequestDTO) {
        return userService.loginAttempt(loginRequestDTO);
    }
}