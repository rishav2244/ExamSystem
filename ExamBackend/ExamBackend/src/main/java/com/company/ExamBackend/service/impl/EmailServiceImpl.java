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

    @Value("${app.security.default-candidate-password}") //Fetched from application.yaml, which in turn
    //derives the value from a .env file.
    private String defaultCandidatePassword; //Default password as in the .env file.

    @Override
    public void sendInvitation(String to, String examTitle) {
        SimpleMailMessage message = new SimpleMailMessage(); //Creating new SimpleMailMessage obj
        message.setTo(to);//Whom to mail to
        message.setSubject("Invitation to Exam: " + examTitle); //Literally subject
        message.setText("Hello! You have been invited to take the exam: " + examTitle +
                ". If this is your first time logging in," +
                " login to the portal with the password "+defaultCandidatePassword+
                ". You should reset this password later."); //Literally content
        mailSender.send(message);
    }
}