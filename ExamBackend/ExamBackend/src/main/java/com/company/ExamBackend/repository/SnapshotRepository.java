package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.Snapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface SnapshotRepository extends JpaRepository<Snapshot, String> {

    @Modifying
    @Transactional
//    @Query("DELETE FROM Snapshot s WHERE s.submission.id = :submissionId")
    void deleteBySubmissionId(String submissionId);

    List<Snapshot> findBySubmissionId(String submissionId);

//    @Query("SELECT s FROM Snapshot s JOIN FETCH s.submission WHERE s.submission.id = :submissionId")
//    List<Snapshot> findBySubmissionId(@Param("submissionId") String submissionId);
}
