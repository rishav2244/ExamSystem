package com.company.ExamBackend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class SnapshotResponseDTO {
    private String id;
    private String submissionId;
    private String studentId;
    private String imageUrl;
    private Instant createdAt;
    private String type;
    private boolean violation;
}