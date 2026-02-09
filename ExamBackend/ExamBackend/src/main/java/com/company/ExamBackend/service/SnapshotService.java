package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.SnapshotRequestDTO;
import com.company.ExamBackend.dto.SnapshotResponseDTO;

import java.util.List;

public interface SnapshotService {
    SnapshotResponseDTO createSnapshot(SnapshotRequestDTO requestDTO);
    List<SnapshotResponseDTO> getSnapshotsBySubmission(String submissionId);
    void deleteSnapshotsForSubmission(String submissionId);
}
