package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, String> {
    List<Submission> findByStatus(String status);
    boolean existsByExamIdAndCandidateEmail(String examId, String candidateEmail);
}