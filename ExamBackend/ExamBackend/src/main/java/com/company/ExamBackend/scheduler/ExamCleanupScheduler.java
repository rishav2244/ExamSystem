package com.company.ExamBackend.scheduler;

import com.company.ExamBackend.model.Submission;
import com.company.ExamBackend.repository.SubmissionRepository;
import com.company.ExamBackend.service.AnswerService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Slf4j
@Component
@AllArgsConstructor
public class ExamCleanupScheduler {

    private final SubmissionRepository submissionRepository;
    private final AnswerService answerService;

    //Checks every 1 minute.
    @Scheduled(fixedRateString = "${app.registration.orphan-exam-cleanup-rate:60000}")
    public void autoSubmitExpiredExams() {
        Instant now = Instant.now();
        Slice<Submission> expired = submissionRepository.findExpiredSubmissions(now, PageRequest.of(0, 100));
        log.info("Checking for expired exams at {}. Found: {}", now, expired.getNumberOfElements());
        for (Submission sub : expired.getContent()) {
            try {
                answerService.finalizeSubmission(sub.getId(), sub.getCandidateEmail());
            } catch (Exception e) {
                log.error("Failed to auto-submit session {}: {}", sub.getId(), e.getMessage());
            }
        }
    }
}