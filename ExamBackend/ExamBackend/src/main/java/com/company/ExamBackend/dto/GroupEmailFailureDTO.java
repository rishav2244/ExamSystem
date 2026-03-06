package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@Schema(description = "Details about why a specific email could not be added to the group.")
public class GroupEmailFailureDTO {
    @Schema(example = "typo@student.com")
    private String email;

    @Schema(example = "User not found / Invalid role: ADMIN")
    private String reason;
}