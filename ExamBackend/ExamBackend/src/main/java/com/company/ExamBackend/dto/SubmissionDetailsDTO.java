package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SubmissionDetailsDTO {

    @Schema(
            description = "Submission ID of candidate submission."
    )
    private String submissionId;

    @Schema(
            example = "John Doe",
            description = "Name of candidate."
    )
    private String candidateName;

    @Schema(
            example = "10",
            description = "Total marks possible in exam"
    )
    private double totalScore;

    @Schema(
            description = "Questions in exam."
    )
    private List<QuestionResultDTO> questions;
}