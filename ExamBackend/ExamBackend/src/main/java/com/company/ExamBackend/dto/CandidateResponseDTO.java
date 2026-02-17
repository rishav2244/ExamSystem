package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CandidateResponseDTO {
    private String id;
    @Schema(
            example = "admin@test.com",
            description = "Candidate's email."
    )
    private String email;

    @Schema(
            example = "John doe",
            description = "Candidate's name."
    )
    private String name;

    @Schema(
            example = "INVITED",
            description = "Candidate's invitation status."
    )
    private String status;

    @Schema(
            example = "Exam1",
            description = "Candidate's name."
    )
    private String examTitle;

    @Schema(
            example = "",
            description = "Candidate's name."
    )
    private String examId;
}
