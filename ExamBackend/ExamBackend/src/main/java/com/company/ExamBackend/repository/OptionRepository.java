package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.Option;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface OptionRepository extends JpaRepository<Option, String> {

    @Modifying
    @Transactional
    @Query("DELETE FROM Option o WHERE o.question.id = :questionId")
    void deleteByQuestionId(String questionId);
}