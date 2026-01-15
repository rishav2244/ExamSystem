package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.Option;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OptionRepository extends JpaRepository<Option, String> {

    List<Option> findByQuestionId(String questionId);

    long countByQuestionId(String questionId);

    boolean existsByQuestionIdAndIsCorrectTrue(String questionId);
}