package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class RegisterRequestDTO
{
    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    @Schema(
            example = "admin@test.com",
            description = "User's email.",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String email;

    @NotBlank(message = "Name cannot be blank.")
    @Schema(
            example = "Srinivas Ramanujan",
            description = "User's name.",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String name;

    @Schema(
            example = "password",
            description = "User's password. " +
                    "Length limit and default for candidates in System Config.",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED
    )
    private String password;

    @NotBlank(message = "Role is needed.")
    @Schema(
            allowableValues = {
                    "ADMIN",
                    "CANDIDATE"
            },
            example = "ADMIN",
            description = "User's role.",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String role;
}
