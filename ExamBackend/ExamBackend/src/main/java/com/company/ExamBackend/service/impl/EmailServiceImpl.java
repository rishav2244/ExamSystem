package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;

    @Value("${app.security.default-candidate-password}")
    private String defaultCandidatePassword;

    @Override
    public void sendInvitation(String to, String examTitle) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Invitation to Exam: " + examTitle);
        message.setText("Hello! You have been invited to take the exam: " + examTitle +
                ". Please login to the portal with the password "+defaultCandidatePassword+
                ". You should reset this password later.");
        mailSender.send(message);
    }
}