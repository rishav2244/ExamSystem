package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class OptionResponseDTO {

    @Schema(
            example = "1",
            description = "Index of option."
    )
    private int optionIndex;

    @Schema(
            example = "One",
            description = "Text of option"
    )
    private String text;
}