package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Value;

@Value
public class CandidateResSearchDTO {

    @Schema(
            description = "Search results in exams named as the query.",
            example = "GK1"
    )
    String query;
}
