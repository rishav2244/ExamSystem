package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.Snapshot;
import com.company.ExamBackend.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, String> {

    List<Submission> findByStatus(String status);

    boolean existsByExamIdAndCandidateEmail(String examId, String candidateEmail);

    List<Submission> findByExamId(String examId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Submission s WHERE s.exam.id = :examId")
    void deleteByExamId(String examId);
}