package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.Snapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

public interface SnapshotRepository extends JpaRepository<Snapshot, String> {

    @Modifying
    @Transactional
    @Query("DELETE FROM Snapshot s WHERE s.submission.id = :submissionId")
    void deleteBySubmissionId(String submissionId);
}
