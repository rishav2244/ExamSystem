package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationResponseDTO {

    @Schema(example = "OTP sent successfully to user@example.com")
    private String message;

    @Schema(example = "600", description = "Time in seconds before the OTP expires.")
    private long ttlSeconds;

    @Schema(example = "60", description = "Time in seconds the user must wait before resending OTP.")
    private long resendSeconds;

    @Schema(example = "6", description = "Maximum allowed verification attempts.")
    private int maxAttempts;
}