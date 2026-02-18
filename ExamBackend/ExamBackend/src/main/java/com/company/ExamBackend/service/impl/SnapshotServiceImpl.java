package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.dto.SnapshotRequestDTO;
import com.company.ExamBackend.dto.SnapshotResponseDTO;
import com.company.ExamBackend.mapper.SnapshotMapper;
import com.company.ExamBackend.model.Snapshot;
import com.company.ExamBackend.model.Submission;
import com.company.ExamBackend.repository.SnapshotRepository;
import com.company.ExamBackend.repository.SubmissionRepository;
import com.company.ExamBackend.service.FileStorage;
import com.company.ExamBackend.service.SnapshotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SnapshotServiceImpl implements SnapshotService {

    private final SnapshotRepository snapshotRepository;
    private final SubmissionRepository submissionRepository;
    private final SnapshotMapper snapshotMapper;
    private final FileStorage fileStorage;

    @Override
    @Transactional
    public SnapshotResponseDTO createSnapshot(SnapshotRequestDTO requestDTO) {
        Submission submission = submissionRepository.findById(requestDTO.getSubmissionId())
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        String savedPath = fileStorage.save(requestDTO.getImage());
        String type = requestDTO.getType();
        boolean violationStatus = requestDTO.isViolation();
        Integer sl_violation = requestDTO.getSl_violation();

        Snapshot snapshot = snapshotMapper.toEntity(submission, savedPath, type, violationStatus, sl_violation);
        Snapshot savedSnapshot = snapshotRepository.save(snapshot);

        return snapshotMapper.toResponseDTO(savedSnapshot);
    }

    @Override
    public List<SnapshotResponseDTO> getSnapshotsBySubmission(String submissionId) {
        return snapshotRepository.findBySubmissionIdOrderByCreatedAtAsc(submissionId).stream()
                .map(snapshotMapper::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public void deleteSnapshotsForSubmission(String submissionId) {
        List<Snapshot> snapshots = snapshotRepository.findBySubmissionIdOrderByCreatedAtAsc(submissionId);
        log.info("Found {} snapshots to delete for submission: {}", snapshots.size(), submissionId);

        for (Snapshot snapshot : snapshots) {
            log.debug("Found image path in DB: {}", snapshot.getImagePath());
            fileStorage.delete(snapshot.getImagePath());
        }

        snapshotRepository.deleteAll(snapshots);
        log.info("Completed database deletion for submission: {}", submissionId);
    }
}