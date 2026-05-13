package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.*;
import com.company.ExamBackend.exception.InvalidActionException;
import com.company.ExamBackend.exception.PasswordMismatchException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface UserService
{
    LoginResponseDTO loginAttempt(LoginRequestDTO loginRequestDTO);
    void logout(String email);
    RegistrationResponseDTO candidateRegisterAttempt(CandidateRegisterRequestDTO candidateRegisterRequestDTO);
    UserResponseDTO verifyRegistration(VerifyOtpRequestDTO dto);
    ResendResponseDTO resendOtp(String email);
    BulkRegistrationSummaryDTO adminRegisterAttempt(AdminRegisterRequestDTO adminRegisterRequestDTO);
    void verifyAndResetPassword(ResetPasswordVerifyDTO dto);

    Page<UserHeavyDTO> getCandidates(Pageable pageable);
    Page<UserHeavyDTO> getUsers(Pageable pageable);
    Page<UserHeavyDTO> searchUsers(UserSearchDTO userSearchDTO, int size, int page, String sort);
    Page<UserHeavyDTO> searchCandidates(UserSearchDTO userSearchDTO, int size, int page, String sort);
    UserHeavyDTO getUserById(String id);
    LoginResponseDTO refreshAccessToken(String refreshTokenRequest);
    void resetPassword(String currentUserEmail, PasswordResetDTO passwordResetDTO);

    void forgotPassword(ForgotPasswordDTO forgotPasswordDTO);
}