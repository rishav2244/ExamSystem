package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GrpMemberDTO {
    private String id;

    @Schema(
            example = "Vikram Sarabhai",
            description = "Name of group member."
    )
    private String name;

    @Schema(
            example = "candidate@test.com",
            description = "Main of group member."
    )
    private String email;
}
