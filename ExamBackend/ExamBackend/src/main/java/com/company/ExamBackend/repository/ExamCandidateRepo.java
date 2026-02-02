package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.ExamCandidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ExamCandidateRepo extends JpaRepository<ExamCandidate,String> {
    List<ExamCandidate> findByExamId(String examId);

    List<ExamCandidate> findByEmail(String email);

    ExamCandidate findByExamIdAndEmail(String examId, String email);

    @Transactional
    void deleteByExamIdAndEmail(String examId, String email);

    //Apparently this custom query is more efficient than JPA query.
    @Modifying
    @Transactional
    @Query("DELETE FROM ExamCandidate c WHERE c.exam.id = :examId")
    void deleteByExamId(String examId);
}
