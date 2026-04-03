package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Value;

import java.time.Instant;

@Value
public class ExamSearchDTO {

    @Schema(
            description = "Exam name or status to search for.",
            example = "GK1"
    )
    String query;
}
