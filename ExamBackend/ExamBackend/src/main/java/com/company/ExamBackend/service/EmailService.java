package com.company.ExamBackend.service;

public interface EmailService {
    void sendInvitation(String to, String examTitle);
    void sendOtp(String to, String otp);
}
