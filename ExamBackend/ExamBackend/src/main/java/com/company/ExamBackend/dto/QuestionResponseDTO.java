package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@Builder
public class QuestionResponseDTO {
    private String id;

    @Schema(
            example = "Atomic number of Hydrogen",
            description = "Text of question."
    )
    private String text;

    @Schema(
            example = "1",
            description = "Marks assigned for question being correct."
    )
    private int marks;

    @Schema(
            example = "1",
            description = "Index of correct option"
    )
    private int correctOptionIndex;

    @Schema(
            description = "List of options."
    )
    private List<OptionResponseDTO> options;
}