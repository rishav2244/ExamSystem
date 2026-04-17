package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserResponseDTO
{
    @Schema(
            example = "Srinivas Ramanujan",
            description = "User's name."
    )
    private String name;

    @Schema(
            example = "admin@test.com",
            description = "User's email."
    )
    private String email;

    @Schema(
            allowableValues = {
                    "ADMIN",
                    "CANDIDATE"
            },
            example = "ADMIN",
            description = "User's role."
    )
    private String role;
}
