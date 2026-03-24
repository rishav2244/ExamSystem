package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SubmissionsOverviewDTO {

    @Schema(
            description = "Total number of exams published",
            example = "3"
    )
    private Long totalExams;

    @Schema(
            description = "Total number of candidate appeared in all exams",
            example = "66"
    )
    private Long candidatesAppeared;

    @Schema(
            description = "Average score over all exams",
            example = "77.5"
    )
    private Double averageScore;

    @Schema(
            description = "Highest marks among all exams, alongside corresponding exams"
    )
    private List<ExamExtremaDTO> highestRecords;

    @Schema(
            description = "Lowest marks among all exams, alongside  corresponding exams."
    )
    private List<ExamExtremaDTO> lowestRecords;

    @Schema(
            description = "Total number of students who have passed across all exams",
            example = "72"
    )
    private Long totalPassed;

    @Schema(
            description = "Total number of students who have failed across all exams",
            example = "28"
    )
    private Long totalFailed;
}