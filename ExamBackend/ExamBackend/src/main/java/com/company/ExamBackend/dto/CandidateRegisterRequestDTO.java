package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CandidateRegisterRequestDTO {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Schema(
            example = "candidate@test.com",
            description = "Candidate's unique email."
    )
    private String email;

    @NotBlank(message = "Name is required")
    @Schema(
            example = "John Doe",
            description = "Candidate's full name."
    )
    private String name;

    @NotBlank(message = "Password is required")
    @Schema(
            example = "password",
            description = "Candidate's chosen password."
    )
    private String password;
}