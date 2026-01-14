package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.Options;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OptionRepository extends JpaRepository<Options,String>
{
    List<Options> findByQuestionIdOrderByOptionIndexAsc(String questionId);

    Optional<Options> findByQuestionIdAndCorrectTrue(String questionId);
}
