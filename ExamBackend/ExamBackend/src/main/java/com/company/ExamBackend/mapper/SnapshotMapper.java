package com.company.ExamBackend.mapper;

import com.company.ExamBackend.dto.SnapshotResponseDTO;
import com.company.ExamBackend.model.Snapshot;
import com.company.ExamBackend.model.Submission;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class SnapshotMapper {

    @Value("${IMAGE_BASE_URL}")
    private String BASE_URL;

    public SnapshotResponseDTO toResponseDTO(Snapshot snapshot) {
        SnapshotResponseDTO dto = new SnapshotResponseDTO();
        dto.setId(snapshot.getId());
        dto.setSubmissionId(snapshot.getSubmission().getId());
        dto.setCreatedAt(snapshot.getCreatedAt());
        dto.setViolation(snapshot.isViolation());
        dto.setType(snapshot.getType());
        dto.setSl_violation(snapshot.getViolationSlNo());
        dto.setImageUrl(BASE_URL + "admin/" + snapshot.getImagePath());
        return dto;
    }

    public Snapshot toEntity(
            Submission submission,
            String savedPath,
            String type,
            boolean violation,
            Integer slNo
    ) {
        Snapshot snapshot = new Snapshot();
        snapshot.setSubmission(submission);
        snapshot.setImagePath(savedPath);
        snapshot.setType(type);
        snapshot.setViolationSlNo(slNo);
        snapshot.setViolation(violation);
        return snapshot;
    }
}