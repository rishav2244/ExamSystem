package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class QuestionResultDTO {

    @Schema(
            description = "ID of specific question."
    )
    private String questionId;

    @Schema(
            example = "Atomic number of Hydrogen",
            description = "Text of question."
    )
    private String questionText;

    @Schema(
            example = "1",
            description = "Marks upon correct choice"
    )
    private int marks;

    @Schema(
            description = "Options associated with question."
    )
    private List<ReviewOptionDTO> options;

    @Schema(
            description = "ID of selected option."
    )
    private String selectedOptionId;

    @Schema(
            example = "true",
            description = "Whether selected option is correct or not.."
    )
    private boolean isCorrect;
}