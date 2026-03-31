package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.Submission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
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

//    Slice<Submission> findByStatus(String status, Pageable pageable);

    @Query(nativeQuery = true, value = "SELECT s.* " +
            "FROM Submission s " +
            "JOIN Exam e ON s.exam_id = e.id " +
            "WHERE s.status = 'IN_PROGRESS' " +
            "AND (s.created_at + (e.duration * INTERVAL '1 minute')) < :now")
    Slice<Submission> findExpiredSubmissions(@Param("now") Instant now, Pageable pageable);

    boolean existsByExamIdAndCandidateEmail(String examId, String candidateEmail);

    Submission findByIdAndCandidateEmail(String submissionId, String candidateEmail);

    List<Submission> findByExamId(String examId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Submission s WHERE s.exam.id = :examId")
    void deleteByExamId(String examId);

    @Query("SELECT e.title, MIN(s.score) " +
            "FROM Submission s " +
            "JOIN s.exam e " +
            "WHERE e.createdBy.email = :adminEmail " +
            "GROUP BY e.title " +
            "ORDER BY MIN(s.score) ASC")
    List <Object[]> findLowestResults(String adminEmail, int topLimit);

    @Query("SELECT e.title, MAX(s.score) " +
            "FROM Submission s " +
            "JOIN s.exam e " +
            "WHERE e.createdBy.email = :adminEmail " +
            "GROUP BY e.title " +
            "ORDER BY MAX(s.score) DESC")
    List <Object[]> findHighestResults(String adminEmail, int topLimit);

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
            "AND s.status = 'COMPLETED' " +
            "AND s.mailed = false")
    List<Object[]> findResultsToSend(String adminEmail, String examId);

//    @Modifying
//    @Transactional
//    @Query("UPDATE Submission s " +
//            "SET s.mailed = true " +
//            "WHERE s.exam.id = :examId " +
//            "AND s.candidateEmail = :email")
//    void markAsMailed(String examId, String email);

    @Modifying
    @Transactional
    @Query("UPDATE Submission s SET s.mailed = true " +
            "WHERE s.exam.id = :examId AND s.candidateEmail IN :emails")
    void markMultipleAsMailed(String examId, List<String> emails);

    @Query("SELECT s.score, s.passed, s.timeTaken, s.createdAt, " +
            "s.exam.totalScore, s.exam.title " +
            "FROM Submission s " +
            "WHERE s.candidateEmail = :candidateEmail " +
            "AND s.status = 'COMPLETED'" +
            "AND s.mailed = true")
    List<Object[]> getCandidateResults(String candidateEmail);
}