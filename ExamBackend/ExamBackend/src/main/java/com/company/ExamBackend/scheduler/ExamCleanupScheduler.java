package com.company.ExamBackend.scheduler;

import com.company.ExamBackend.model.Submission;
import com.company.ExamBackend.repository.SubmissionRepository;
import com.company.ExamBackend.service.AnswerService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
@AllArgsConstructor
public class ExamCleanupScheduler {

    private final SubmissionRepository submissionRepository;
    private final AnswerService answerService;

    //Checks every 1 minute.
    @Scheduled(fixedRateString = "${app.registration.orphan-exam-cleanup-rate:60000}")
    public void autoSubmitExpiredExams() {
        Slice<Submission> slice;

        Instant now = Instant.now();

        do {
            // 100 entries should be reasonable methinks
            slice = submissionRepository.findByStatus("IN_PROGRESS", PageRequest.of(0, 100));
            if (slice.isEmpty()) break; // We don't deal with empty slices
            for (Submission sub : slice.getContent()) {
                Instant deadline = sub.getCreatedAt().plusSeconds(sub.getExam().getDuration() * 60L);
                if (now.isAfter(deadline)) {
                    try {
                        answerService.finalizeSubmission(sub.getId(), sub.getCandidateEmail());
                    } catch (Exception e) {
                    }
                }
            }
        }while (slice.hasNext());
    }
}