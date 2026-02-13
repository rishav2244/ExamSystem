package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequestDTO
{
    @NotBlank(message = "Password is required")
    @Schema(
            example = "password",
            description = "Password as entered by user."
    )
    private String password;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Schema(
            example = "admin@test.com",
            description = "Email address as entered by user."
    )
    private String email;
}
