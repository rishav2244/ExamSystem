package com.company.ExamBackend.mapper;

import com.company.ExamBackend.dto.SnapshotResponseDTO;
import com.company.ExamBackend.model.Snapshot;
import com.company.ExamBackend.model.Submission;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class SnapshotMapper {

    @Value("${APP_IMAGE_BASE_URL}")
    private String BASE_URL;

    public SnapshotResponseDTO toResponseDTO(Snapshot snapshot) {
        SnapshotResponseDTO dto = new SnapshotResponseDTO();
        dto.setId(snapshot.getId());
        dto.setSubmissionId(snapshot.getSubmission().getId());
        dto.setCreatedAt(snapshot.getCreatedAt());
        dto.setViolation(snapshot.isViolation());
        dto.setImageUrl(BASE_URL + snapshot.getImagePath());
        return dto;
    }

    public Snapshot toEntity(Submission submission, String savedPath, boolean violation) {
        Snapshot snapshot = new Snapshot();
        snapshot.setSubmission(submission);
        snapshot.setImagePath(savedPath);
        snapshot.setCreatedAt(Instant.now());
        snapshot.setViolation(violation);
        return snapshot;
    }
}