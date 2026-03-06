package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.Exam;
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
    List<Exam> findByStatusAndCreatedBy_Email(String status, String email);

    List<Exam> findByCreatedBy_Email(String email);

    @Modifying
    @Transactional
    @Query("UPDATE Exam e SET e.status = :status WHERE e.id = :examId")
    int updateExamStatus(String examId, String status);
}