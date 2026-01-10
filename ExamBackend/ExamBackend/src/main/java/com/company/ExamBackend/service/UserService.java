package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.LoginRequestDTO;
import com.company.ExamBackend.dto.RegisterRequestDTO;
import com.company.ExamBackend.dto.UserResponseDTO;

public interface UserService
{
    UserResponseDTO loginAttempt(LoginRequestDTO loginRequestDTO);
    UserResponseDTO registerAttempt(RegisterRequestDTO registerRequestDTO);
}