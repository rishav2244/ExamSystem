package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface ExamRepository extends JpaRepository<Exam, String> {
    List<Exam> findCreatedById(String id);

    List<Exam> findByStartTimeBeforeAndEndTimeAfter(Instant now1, Instant now2);

    List<Exam> findByStatus(String status);
}