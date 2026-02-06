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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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

        Snapshot snapshot = snapshotMapper.toEntity(requestDTO.getStudentId(), submission, savedPath);
        Snapshot savedSnapshot = snapshotRepository.save(snapshot);

        return snapshotMapper.toResponseDTO(savedSnapshot);
    }

    @Override
    public List<SnapshotResponseDTO> getSnapshotsBySubmission(String submissionId) {
        return snapshotRepository.findAll().stream()
                .filter(s -> s.getSubmission().getId().equals(submissionId))
                .map(snapshotMapper::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public void deleteSnapshotsForSubmission(String submissionId) {
        snapshotRepository.deleteBySubmissionId(submissionId);
    }
}