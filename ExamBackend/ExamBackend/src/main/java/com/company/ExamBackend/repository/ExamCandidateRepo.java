package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.ExamCandidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ExamCandidateRepo extends JpaRepository<ExamCandidate,String> {
    List<ExamCandidate> findByExamId(String examId);

    @Transactional
    void deleteByExamIdAndEmail(String examId, String email);
}
