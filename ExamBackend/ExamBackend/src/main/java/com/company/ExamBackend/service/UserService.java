package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.*;

import java.util.List;

public interface UserService
{
    UserResponseDTO loginAttempt(LoginRequestDTO loginRequestDTO);
    UserResponseDTO registerAttempt(RegisterRequestDTO registerRequestDTO);
    List<UserHeavyDTO> getCandidates();
    List<UserHeavyDTO> getUsers();
    UserHeavyDTO getUserById(String id);
    String getToken(String email);
    void resetPassword(PasswordResetDTO passwordResetDTO);
}