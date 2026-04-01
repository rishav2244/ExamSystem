package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.Exam;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExamRepository extends JpaRepository<Exam, String> {
    Page<Exam> findByStatusAndCreatedBy_Email(String status, String email, Pageable pageable);

    Page<Exam> findByCreatedBy_Email(String email, Pageable pageable);

    @Modifying
    @Transactional
    @Query("UPDATE Exam e SET e.status = :status WHERE e.id = :examId")
    int updateExamStatus(String examId, String status);

    @Query("SELECT COUNT(e) " +
            "FROM Exam e " +
            "WHERE e.status = 'PUBLISHED' " +
            "AND e.createdBy.email = :adminEmail")
    Long publishedCount(String adminEmail);
}