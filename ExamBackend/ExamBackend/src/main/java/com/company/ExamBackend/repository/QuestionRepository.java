package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, String>
{
    List<Question> findByParentExamId(String examId);
}
