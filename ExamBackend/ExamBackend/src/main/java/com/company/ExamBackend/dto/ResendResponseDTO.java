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
public class ResendResponseDTO {

    @Schema(example = "true")
    private boolean success;

    @Schema(example = "A new OTP has been sent.")
    private String message;

    @Schema(example = "60", description = "Seconds the user must wait before requesting another OTP.")
    private long waitTimeSeconds;
}