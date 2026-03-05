package com.company.ExamBackend.scheduler;

import com.company.ExamBackend.repository.PendingRegistrationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class RegistrationCleanupScheduler {

    private final PendingRegistrationRepository pendingRepository;

    @Transactional
    @Scheduled(fixedRate = 5000) // 5 seconds
    public void purgeStaleRegistrations() {
        log.debug("Cleanup cycle triggered at {}", Instant.now());
        pendingRepository.deleteExpiredRequests(Instant.now());
    }
}