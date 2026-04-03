package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Value;

@Value
public class GrpSearchDTO {

    @Schema(
            description = "Group name to search for.",
            example = "6E"
    )
    String query;
}
