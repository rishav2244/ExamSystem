package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class RegisterRequestDTO
{
    @Schema(
            example = "admin@test.com",
            description = "User's email."
    )
    private String email;

    @Schema(
            example = "Srinivas Ramanujan",
            description = "User's name."
    )
    private String name;

    @Schema(
            example = "password",
            description = "User's password. " +
                    "Length limit and default for candidates in System Config."
    )
    private String password;

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
