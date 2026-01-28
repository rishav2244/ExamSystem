package com.company.ExamBackend.scheduler;

import com.company.ExamBackend.model.Submission;
import com.company.ExamBackend.repository.SubmissionRepository;
import com.company.ExamBackend.service.AnswerService;
import lombok.AllArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
@AllArgsConstructor
public class ExamCleanupScheduler {

    private final SubmissionRepository submissionRepository;
    private final AnswerService answerService;

    @Scheduled(fixedRate = 60000)
    public void autoSubmitExpiredExams() {
        List<Submission> activeSubmissions = submissionRepository.findByStatus("IN_PROGRESS");

        Instant now = Instant.now();

        for (Submission sub : activeSubmissions) {
            Instant deadline = sub.getCreatedAt().plusSeconds(sub.getExam().getDuration() * 60L);
            if (now.isAfter(deadline)) {
                try {
                    answerService.finalizeSubmission(sub.getId());
                } catch (Exception e) {
                }
            }
        }
    }
}