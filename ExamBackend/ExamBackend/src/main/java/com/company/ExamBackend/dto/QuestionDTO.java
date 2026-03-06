package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class QuestionDTO {
    @Schema(
            example = "What is the capital of France?", description = "The question prompt."
    )
    @NotBlank(message = "Question text is required")
    private String text;

    @Schema(
            example = "4",
            description = "Marks awarded for the correct answer."
    )
    @Min(value = 1, message = "Marks must be at least 1")
    private int marks;

    @Schema(
            example = "1",
            description = "The index (zero-based) of the correct option from the options list."
    )
    @Min(value = 0, message = "Invalid correct option index")
    private int correctOptionIndex;

    @Schema(
            description = "Possible answers for the question."
    )
    @Size(min = 2, message = "A question must have at least 2 options")
    @Valid
    private List<OptionDTO> options;
}