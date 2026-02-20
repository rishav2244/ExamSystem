package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewOptionDTO {
    private String id;

    @Schema(
            example = "3",
            description = "Index of option."
    )
    private int optionIndex;

    @Schema(
            example = "One",
            description = "Text of option."
    )
    private String text;

    @Schema(
            example = "true",
            description = "Whether option is correct or not.."
    )
    private boolean isCorrect;
}