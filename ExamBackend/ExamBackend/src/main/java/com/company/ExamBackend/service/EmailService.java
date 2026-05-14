package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.CandidateResultObj;
import com.company.ExamBackend.dto.ResultMailResponseDTO;

import java.util.List;

public interface EmailService {
    void sendInvitation(String to, String examTitle);
    void sendRegistrationOtp(String to, String otp);
    void sendForgotPasswordOtp(String to, String otp);
    ResultMailResponseDTO sendResults(List<CandidateResultObj> candidateResults);
    void sendExamCompletionConfirmation(String to, String examTitle);
    void sendInviteRevoke(String to, String examTitle);
}
