package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class ExamResponseDTO {
    private String id;

    @Schema(
            description = "Title/name of exam.",
            example = "GK1"
    )
    private String title;

    @Schema(
            description = "Duration of exam in minutes.",
            example = "1"
    )
    private int duration;

    @Schema(
            description = "Start time of exam."
    )
    private Instant startTime;

    @Schema(
            description = "End time of exam."
    )
    private Instant endTime;

    @Schema(
            description = "Status of created exam. Expectedly SAVED at this stage.",
            example = "SAVED"
    )
    private String status;

    @Schema(
            description = "Passing cutoff percentage of exam.",
            example = "50"
    )
    private double cutoff;

    @Schema(
            description = "Total marks of exam.",
            example = "10"
    )
    private int totalMarks;

    @Schema(
            description = "Email of exam creator(ADMIN)",
            example = "admin@test.com"
    )
    private String createdBy;
}
