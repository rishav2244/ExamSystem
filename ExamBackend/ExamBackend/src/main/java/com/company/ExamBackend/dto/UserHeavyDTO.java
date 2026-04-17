package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserHeavyDTO {
    @Schema(
            example = "e080abaa-eae0-4d9d-be35-050a3a75c821",
            description = "UUID-style user ID."
    )
    private String id;

    @Schema(
            example = "Manuel Komnenos",
            description = "Name of user."
    )
    private String name;

    @Schema(
            example = "admin@test.com",
            description = "Email of user."
    )
    private String email;

    @Schema(
            example = "ADMIN",
            description = "Role of user.",
            allowableValues = {
                    "ADMIN",
                    "CANDIDATE"
            }
    )
    private String role;
}
