package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
public class SubmissionResponseDTO {
    private String id;

    @Schema(
            example = "John Doe",
            description = "Name of CANDIDATE."
    )
    private String candidateName;

    @Schema(
            example = "admin@test.com",
            description = "Email of candidate."
    )
    private String candidateEmail;

    @Schema(
            example = "5",
            description = "Score of candidate in this exam."
    )
    private double score;

    @Schema(
            example = "2",
            description = "Time (Minutes) for which candidates were in exam."
    )
    private int timeTaken;

    @Schema(
            description = "Time at which exam was submitted."
    )
    private Instant submittedAt;

    @Schema(
            example = "ONGOING",
            description = "Status of exam for the candidate."
    )
    private String status;

    @Schema(
            example = "2",
            description = "Number of times candidate caused violations."
    )
    private int violations;
}