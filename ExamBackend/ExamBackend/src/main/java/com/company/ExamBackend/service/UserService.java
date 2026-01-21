package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.LoginRequestDTO;
import com.company.ExamBackend.dto.RegisterRequestDTO;
import com.company.ExamBackend.dto.UserHeavyDTO;
import com.company.ExamBackend.dto.UserResponseDTO;

import java.util.List;

public interface UserService
{
    UserResponseDTO loginAttempt(LoginRequestDTO loginRequestDTO);
    UserResponseDTO registerAttempt(RegisterRequestDTO registerRequestDTO);
    List<UserHeavyDTO> getUsers();
    UserHeavyDTO getUserById(String id);
}