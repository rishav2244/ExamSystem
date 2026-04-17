package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService
{
    LoginResponseDTO loginAttempt(LoginRequestDTO loginRequestDTO);
    void logout(String email);
    RegistrationResponseDTO candidateRegisterAttempt(CandidateRegisterRequestDTO candidateRegisterRequestDTO);
    UserResponseDTO verifyRegistration(VerifyOtpRequestDTO dto);
    ResendResponseDTO resendOtp(String email);
    BulkRegistrationSummaryDTO adminRegisterAttempt(AdminRegisterRequestDTO adminRegisterRequestDTO);
    Page<UserHeavyDTO> getCandidates(Pageable pageable);
    Page<UserHeavyDTO> getUsers(Pageable pageable);
    Page<UserHeavyDTO> searchUsers(UserSearchDTO userSearchDTO, int size, int page, String sort);
    Page<UserHeavyDTO> searchCandidates(UserSearchDTO userSearchDTO, int size, int page, String sort);
    UserHeavyDTO getUserById(String id);
    LoginResponseDTO refreshAccessToken(String refreshTokenRequest);
    void resetPassword(String currentUserEmail, PasswordResetDTO passwordResetDTO);
}