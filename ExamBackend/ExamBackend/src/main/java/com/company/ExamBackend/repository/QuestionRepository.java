package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, String> {
    List<Question> findByParentExamId(String examId);

    long countByParentExamId(String examId);

    void deleteByParentExamId(String examId);
}
