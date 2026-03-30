package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, String> {
    Optional<Answer> findBySubmissionIdAndQuestionId(String submissionId, String questionId);
    List<Answer> findBySubmissionId(String submissionId);

    // Reportedly more efficient due to no n+1 queries
    // Also note that without FETCH, Hibernate tends to just make references instead of getting actual
    // data. So when we  try to get actual info about a question, it goes "Oh right forgot brb" and make
    // another call to db to get the corresponding question. What "Physically" happens without FETCH is
    // that you get only questionId in the JOINed table's q attribute unless you use JOIN FETCH.
    // Also, if you're confused, this is particularly useful in the service that calculates score of
    // a candidate.
    @Query("SELECT a FROM Answer a " +
            "JOIN FETCH a.question q " +
            "LEFT JOIN FETCH a.selectedOption o " +
            "WHERE a.submission.id = :submissionId")
    List<Answer> findBySubmissionIdWithDetails(@Param("submissionId") String submissionId);

    @Query("SELECT COALESCE(SUM(a.question.marks * 1.0), 0.0), " +
            "(CASE WHEN (COALESCE(SUM(a.question.marks * 1.0), 0.0) >= " +
            "(a.submission.exam.totalScore * a.submission.exam.cutoff / 100.0)) " +
            "THEN true ELSE false END) " +
            "FROM Answer a " +
            "WHERE a.submission.id = :submissionId " +
            "AND a.submission.candidateEmail = :candidateEmail " +
            "AND a.selectedOption.isCorrect = true " +
            "GROUP BY a.submission.exam.cutoff, a.submission.exam.totalScore")
    List<Object[]> calculateResult(@Param("submissionId") String submissionId, @Param("candidateEmail") String candidateEmail);

    @Modifying
    @Transactional
    @Query("DELETE FROM Answer s WHERE s.submission.id = :submissionId")
    void deleteBySubmissionId(String submissionId);
}