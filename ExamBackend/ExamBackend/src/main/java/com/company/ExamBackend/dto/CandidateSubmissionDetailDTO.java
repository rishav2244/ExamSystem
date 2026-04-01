package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CandidateSubmissionDetailDTO{

    @Schema(
            description = "Candidate exam title",
            example = "GK1"
    )
    private String title;

    @Schema(
            description = "Candidate score",
            example = "6.0"
    )
    private Double score;

    @Schema(
            description = "Total score possible in exam",
            example = "10.0"
    )
    private Double totalScore;

    @Schema(
            description = "Whether candidate has passed the exam or not",
            example = "true"
    )
    private Boolean passed;

    @Schema(
            description = "Date on which candidate has appeared for the exam",
            example = "2026-03-26T14:30:00Z"
    )
    private Instant date;

    @Schema(
            description = "Time taken in minutes by candidate before submitting exam",
            example = "30"
    )
    private Integer timeTaken;
}