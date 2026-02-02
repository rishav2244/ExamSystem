package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, String> {
    Optional<Answer> findBySubmissionIdAndQuestionId(String submissionId, String questionId);
    List<Answer> findBySubmissionId(String submissionId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Answer s WHERE s.submission.id = :submissionId")
    void deleteBySubmissionId(String submissionId);
}