package com.company.ExamBackend.scheduler;

import com.company.ExamBackend.repository.PendingRegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
@Component
@RequiredArgsConstructor
public class RegistrationCleanupScheduler {
    private final PendingRegistrationRepository pendingRepository;
    @Scheduled(cron = "0 0/30 * * * *")
    public void purgeStaleRegistrations() {
        pendingRepository.deleteExpiredRequests(Instant.now());
    }
}