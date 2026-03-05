package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.PendingRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface PendingRegistrationRepository extends JpaRepository<PendingRegistration, String> {

    // Used to check if someone is already in 'purgatory'
    Optional<PendingRegistration> findByEmail(String email);

    // Deletes records that are:
    // Expired (valid = true but time passed)
    // Finished with their cool-down (valid = false and time passed)
    @Transactional
    @Modifying
    @Query("DELETE FROM PendingRegistration p WHERE p.validUntil < :threshold")
    void deleteExpiredRequests(@Param("threshold") Instant threshold);
}