package com.company.ExamBackend.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
public class SubmissionResponseDTO {
    private String id;
    private String candidateName;
    private String candidateEmail;
    private Float score;
    private int timeTaken;
    private Instant submittedAt;
    private String status;
    private int violations;
}