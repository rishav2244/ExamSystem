package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BulkRegistrationSummaryDTO {
    @Schema(
            example = "100",
            description = "Total number of users sent in the request."
    )
    private int totalProcessed;

    @Schema(
            example = "98",
            description = "Number of users successfully created."
    )
    private int successCount;

    @Schema(
            example = "2",
            description = "Number of users that failed registration."
    )
    private int errorCount;

    @Schema(
            description = "List of specific errors encountered per email."
    )
    private List<RegistrationError> details;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class RegistrationError {
        @Schema(
                example = "duplicate@test.com"
        )
        private String email;

        @Schema(
                example = "Email already exists"
        )
        private String reason;
    }
}