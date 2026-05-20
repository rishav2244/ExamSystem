package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.ExamCandidate;
import com.company.ExamBackend.model.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
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

    @Query("SELECT gm.user " +
            "FROM GroupMember gm " +
            "WHERE gm.group.id = :groupId " +
            "AND gm.user.email NOT IN ( " +
            "SELECT ec.email " +
            "FROM ExamCandidate ec " +
            "WHERE ec.exam.id = :examId" +
            " )")
    Page<Users> findUsersInGroupNotInExam(String groupId, String examId, Pageable pageable);

    @Query("SELECT ec FROM ExamCandidate ec WHERE ec.exam.id = :examId AND ec.status = 'UNINVITED'")
    Page<ExamCandidate> findUninvitedByExamId(String examId, Pageable pageable);

    List<ExamCandidate> findByEmail(String email);

    ExamCandidate findByExamIdAndEmail(String examId, String email);

    @Transactional
    void deleteByExamIdAndEmail(String examId, String email);

    //Apparently this custom query is more efficient than JPA query.
    @Modifying
    @Transactional
    @Query("DELETE FROM ExamCandidate c WHERE c.exam.id = :examId")
    void deleteByExamId(String examId);

    @Query("SELECT ec " +
            "FROM ExamCandidate ec " +
            "JOIN ec.exam e " +
            "WHERE ec.email = :email " +
            "AND :now BETWEEN e.startTime AND e.endTime " +
            "AND ec.status != 'COMPLETED' " + // Use a terminal status
            "AND NOT EXISTS (" +
            "  SELECT s FROM Submission s " +
            "  WHERE s.candidateEmail = :email " +
            "  AND s.exam.id = e.id " +
            "  AND s.status = 'COMPLETED'" + // Or whatever your final status is
            ")")
    List<ExamCandidate> findActiveDashboardExams(String email, Instant now);
}
