package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.dto.CandidateResultObj;
import com.company.ExamBackend.dto.EmailFailure;
import com.company.ExamBackend.dto.ResultMailResponseDTO;
import com.company.ExamBackend.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;

    @Value("${app.security.default-candidate-password}") //Fetched from application.yaml, which in turn
    //derives the value from a .env file.
    private String defaultCandidatePassword; //Default password as in the .env file.

    @Value("${app.registration.otp-ttl}") // OTP TTL as in the .env file
    private String expiryTime;

    @Override
    public void sendInvitation(String to, String examTitle) {
        SimpleMailMessage message = new SimpleMailMessage(); //Creating new SimpleMailMessage obj
        message.setTo(to);//Whom to mail to
        message.setSubject("Invitation to Exam: " + examTitle); //Literally subject
        message.setText("Hello! You have been invited to take the exam: " + examTitle +
                ". If this is your first time logging in," +
                " login to the portal with the password "+defaultCandidatePassword+
                ". You should reset this password later." +
                " If you are self-registered, ignore the default password."); //Literally content
        mailSender.send(message);
    }

    @Override
    public void sendRegistrationOtp(String to, String otp) {
        long minutes = Long.parseLong(expiryTime) / 60000;
        String expiryInMinutes = String.valueOf(minutes);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your Examination Portal Verification Code");
        message.setText("Your OTP for registration is: " + otp +
                ". This code is valid for " + expiryInMinutes +
                " minutes.");
        mailSender.send(message);
    }

    @Override
    public void sendForgotPasswordOtp(String to, String otp) {
        long minutes = Long.parseLong(expiryTime) / 60000;
        String expiryInMinutes = String.valueOf(minutes);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Examination Portal forgot password OTP");
        message.setText("Your OTP is: " + otp +
                ". This code is valid for " + expiryInMinutes +
                " minutes.");
        mailSender.send(message);
    }

    @Override
    public ResultMailResponseDTO sendResults(List<CandidateResultObj> candidateResults){

        ResultMailResponseDTO resultMailResponseDTO = new ResultMailResponseDTO();
        long emailFailureCount = 0L;

        for(CandidateResultObj candidateResult: candidateResults){

            resultMailResponseDTO.setAttempted(resultMailResponseDTO.getAttempted()+1);

            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(candidateResult.getEmail());
                message.setSubject("Your performance in " + candidateResult.getExamTitle());
                if (candidateResult.isPassed()) {
                    message.setText("Congratulations! You have passed the exam with a score of " + candidateResult.getScore() + " !");
                } else {
                    message.setText("We regret to inform you that you have not passed the exam. Your score was " + candidateResult.getScore() + ".");
                }
                mailSender.send(message);
            }
            catch (Exception e) {
                log.error(e.getMessage());

                emailFailureCount++;

                EmailFailure emailFailure = new EmailFailure(candidateResult.getEmail(), e.getMessage());

                resultMailResponseDTO.getEmailInfo().add(emailFailure);
                resultMailResponseDTO.setFailed(emailFailureCount);
            }
        }
        return resultMailResponseDTO;
    }

    @Async
    @Override
    public void sendExamCompletionConfirmation(String to, String examTitle)
    {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Exam Completion Confirmation");
        message.setText("Your submission for the exam "+examTitle+" has been successfully received." +
                " You will be mailed your results and will be able to see the same in your dashboard.");
        mailSender.send(message);
    }
}