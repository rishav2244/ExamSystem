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
        // Use the standard repository method
        List<Submission> activeSubmissions = submissionRepository.findByStatus("IN_PROGRESS");

        Instant now = Instant.now();

        for (Submission sub : activeSubmissions) {
            // Logic: StartTime + (Duration in Minutes)
            Instant deadline = sub.getCreatedAt().plusSeconds(sub.getExam().getDuration() * 60L);

            // If the current time has passed the deadline
            if (now.isAfter(deadline)) {
                try {
                    answerService.finalizeSubmission(sub.getId());
                } catch (Exception e) {
                    // Fail silently for this iteration to avoid breaking the loop
                }
            }
        }
    }
}