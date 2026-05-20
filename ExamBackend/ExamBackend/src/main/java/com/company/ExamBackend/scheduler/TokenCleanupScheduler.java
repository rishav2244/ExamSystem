package com.company.ExamBackend.scheduler;

import com.company.ExamBackend.repository.PasswordResetTokenRepository;
import com.company.ExamBackend.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class TokenCleanupScheduler {

    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Transactional
    @Scheduled(fixedRateString = "${app.schedulers.token-cleanup-rate:3600000}")
    public void purgeExpiredTokens() {
        log.info("Starting expired refresh token cleanup...");
        try {
            refreshTokenRepository.deleteExpiredTokens(Instant.now());
            log.info("Cleanup cycle for expired tokens completed.");
        } catch (Exception e) {
            log.error("Failed to purge expired tokens: {}", e.getMessage());
        }
    }

    @Transactional
    @Scheduled(fixedRateString = "${app.schedulers.reset-token-cleanup-rate:3600000}")
    public void purgeOrphanedPasswordResets() {
        log.info("Starting orphaned password reset token cleanup...");
        try {
            passwordResetTokenRepository.purgeInvalidTokens(Instant.now());
            log.info("Cleanup cycle for password reset tokens completed.");
        } catch (Exception e) {
            log.error("Failed to purge password reset tokens: {}", e.getMessage());
        }
    }
}