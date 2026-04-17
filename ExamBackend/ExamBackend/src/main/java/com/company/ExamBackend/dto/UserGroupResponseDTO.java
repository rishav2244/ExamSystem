package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserGroupResponseDTO {
    private String id;

    @Schema(
            example = "Class 6E",
            description = "Name of group."
    )
    private String name;

    @Schema(
            example = "admin@test.com",
            description = "Mail of admin creating the group."
    )
    private String creatorName;
}