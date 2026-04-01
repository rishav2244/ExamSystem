package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.ExamCandidate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ExamCandidateRepo extends JpaRepository<ExamCandidate,String> {
    @Query("SELECT ec " +
            "FROM ExamCandidate ec " +
            "JOIN FETCH ec.exam e " +
            "JOIN e.createdBy u " +
            "WHERE u.email = :adminEmail " +
            "AND e.id = :examId")
    List<ExamCandidate> findByExamIdAndAdminEmail(String examId, String adminEmail);

    @Query("SELECT ec " +
            "FROM ExamCandidate ec " +
            "JOIN ec.exam e " +
            "JOIN e.createdBy u " +
            "WHERE u.email = :adminEmail " +
            "AND e.id = :examId")
    Page<ExamCandidate> findByExamIdAndAdminEmail(String examId, String adminEmail, Pageable pageable);

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
