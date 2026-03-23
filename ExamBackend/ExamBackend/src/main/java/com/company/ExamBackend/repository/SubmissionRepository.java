package com.company.ExamBackend.repository;

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

    @Query("SELECT e.title, s.score " +
            "FROM Submission s " +
            "JOIN s.exam e " +
            "WHERE s.score = " +
            "(SELECT MIN(s2.score) " +
            "FROM Submission s2 " +
            "WHERE s2.exam.createdBy.email = :adminEmail) " +
            "AND s.exam.createdBy.email = :adminEmail")
    List <Object[]> findLowestResults(String adminEmail);

    @Query("SELECT e.title, s.score " +
            "FROM Submission s " +
            "JOIN s.exam e " +
            "WHERE s.score = " +
            "(SELECT MAX(s2.score) " +
            "FROM Submission s2 " +
            "WHERE s2.exam.createdBy.email = :adminEmail) " +
            "AND s.exam.createdBy.email = :adminEmail")
    List <Object[]> findHighestResults(String adminEmail);

    @Query("SELECT COALESCE(AVG(s.score),0.0) " +
            "FROM Submission s " +
            "JOIN s.exam e " +
            "WHERE s.exam.createdBy.email = :adminEmail")
    Double findAverageScore(String adminEmail);

    @Query("SELECT COALESCE(COUNT(s),0) " +
            "FROM Submission s " +
            "WHERE s.passed is true " +
            "AND s.exam.createdBy.email = :adminEmail")
    Long findPassedCount(String adminEmail);

    @Query("SELECT COALESCE(COUNT(s),0) " +
            "FROM Submission s " +
            "JOIN s.exam e " +
            "WHERE s.exam.createdBy.email = :adminEmail")
    Long findAppearedCount(String adminEmail);

    @Query("SELECT s.exam.title, " +
            "s.candidateName, " +
            "s.candidateEmail, " +
            "s.score, " +
            "s.passed " +
            "FROM Submission s " +
            "JOIN s.exam e " +
            "WHERE s.exam.createdBy.email = :adminEmail " +
            "AND s.exam.id = :examId " +
            "AND s.status = 'COMPLETED'")
    List<Object[]> findResultsToSend(String adminEmail, String examId);
}