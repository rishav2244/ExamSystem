package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.Snapshot;
import com.company.ExamBackend.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, String> {

    // Fetches submissions for an exam ONLY if that exam belongs to the admin
    @Query("SELECT s FROM Submission s WHERE s.exam.id = :examId AND s.exam.createdBy.email = :adminEmail")
    List<Submission> findByExamIdAndAdminEmail(String examId, String adminEmail);

    // Fetches a single submission details ONLY if it belongs to the admin's exam
    @Query("SELECT s FROM Submission s WHERE s.id = :submissionId AND s.exam.createdBy.email = :adminEmail")
    Optional<Submission> findByIdAndAdminEmail(String submissionId, String adminEmail);

    List<Submission> findByStatus(String status);

    boolean existsByExamIdAndCandidateEmail(String examId, String candidateEmail);

    List<Submission> findByExamId(String examId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Submission s WHERE s.exam.id = :examId")
    void deleteByExamId(String examId);
}