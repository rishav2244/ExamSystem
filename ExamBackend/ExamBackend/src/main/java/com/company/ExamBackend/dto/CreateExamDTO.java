package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class CreateExamDTO {

    @Schema(
            description = "Title/name of exam",
            example = "GK1"
    )
    private String title;

    @Schema(
            description = "Title/name of exam",
            example = "GK1"
    )
    private int duration;

    @Schema(
            description = "Start time of exam"
    )
    private Instant startTime;

    @Schema(
            description = "End time of exam"
    )
    private Instant endTime;

    @Schema(
            description = "Publishing status of exam, such as SAVED, PUBLISHED, DRAFT, etc.",
            example = "SAVED"
    )
    private String status;

    @Schema(
            description = "Passing cutoff of exam.",
            example = "50"
    )
    private int cutoff;

    @Schema(
            description = "Email of exam creator(ADMIN)",
            example = "admin@test.com"
    )
    private String createdBy;
}
