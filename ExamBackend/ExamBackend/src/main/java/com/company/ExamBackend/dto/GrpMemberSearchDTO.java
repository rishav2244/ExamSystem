package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Value;

@Value
public class GrpMemberSearchDTO {
    @Schema(
            description = "Group member name or email to search for.",
            example = "candidate@test.com"
    )
    String query;
}
