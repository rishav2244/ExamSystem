package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.*;

import java.util.List;

public interface UserService
{
    UserResponseDTO loginAttempt(LoginRequestDTO loginRequestDTO);
    UserResponseDTO candidateRegisterAttempt(CandidateRegisterRequestDTO candidateRegisterRequestDTO);
    BulkRegistrationSummaryDTO adminRegisterAttempt(AdminRegisterRequestDTO adminRegisterRequestDTO);
    List<UserHeavyDTO> getCandidates();
    List<UserHeavyDTO> getUsers();
    UserHeavyDTO getUserById(String id);
    String getToken(String email);
    void resetPassword(String currentUserEmail, PasswordResetDTO passwordResetDTO);
}