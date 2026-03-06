package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ExamSetupDTO {
    @Schema(
            example = "40.5", description = "The minimum percentage required to pass the exam."
    )
    @Min(value = 0, message = "Cutoff cannot be negative")
    @Max(value = 100, message = "Cutoff percentage cannot exceed 100")
    private Double cutoff;

    @Schema(
            example = "40.5", description = "The list of questions to be included in the exam."
    )
    @NotEmpty(message = "Exam must have at least one question")
    @Valid
    private List<QuestionDTO> questions;
}