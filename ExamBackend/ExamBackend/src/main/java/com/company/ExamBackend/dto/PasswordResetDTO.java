package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordResetDTO {

    @NotBlank(message = "Current password is required")
    @Schema(
            example = "password",
            description = "Current password as entered by user."
    )
    private String oldPassword;

    @NotBlank(message = "New password is required")
    @Schema(
            example = "password",
            description = "New password as entered by user."
    )
    private String newPassword;
}