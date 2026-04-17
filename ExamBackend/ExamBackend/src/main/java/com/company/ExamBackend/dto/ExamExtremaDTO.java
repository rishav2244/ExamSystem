package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ExamExtremaDTO {
    @Schema(
            description = "Exam in which score was extreme",
            example = "GK1"
    )
    private String title;

    @Schema(
            description = "Corresponding score",
            example = "12"
    )
    private Double score;
}
