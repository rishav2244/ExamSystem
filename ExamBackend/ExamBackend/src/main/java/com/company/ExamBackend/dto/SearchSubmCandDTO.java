package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Value;

@Value
public class SearchSubmCandDTO {

    @Schema(
            description = "Exam ID to search from"
    )
    String examId;

    @Schema(
            description = "Name or email to search for",
            example = "candidate@test.com"
    )
    String query;
}
