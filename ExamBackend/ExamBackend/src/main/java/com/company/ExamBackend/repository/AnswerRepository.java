package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, String> {
    Optional<Answer> findBySubmissionIdAndQuestionId(String submissionId, String questionId);
    List<Answer> findBySubmissionId(String submissionId);

    //Reportedly more efficient due to no n+1 queries
    @Query("SELECT a FROM Answer a " +
            "JOIN FETCH a.question q " +
            "LEFT JOIN FETCH a.selectedOption o " +
            "WHERE a.submission.id = :submissionId")
    List<Answer> findBySubmissionIdWithDetails(@Param("submissionId") String submissionId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Answer s WHERE s.submission.id = :submissionId")
    void deleteBySubmissionId(String submissionId);
}