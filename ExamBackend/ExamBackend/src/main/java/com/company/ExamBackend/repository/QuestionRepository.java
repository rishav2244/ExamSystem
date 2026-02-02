package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, String> {
    List<Question> findByParentExamId(String examId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Question q WHERE q.parentExam.id = :examId")
    void deleteByParentExamId(String examId);

    List<Question> findAllByParentExamIdOrderByIdAsc(String examId);
}
