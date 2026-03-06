package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AdminRegisterRequestDTO {
    @NotEmpty(message = "User list cannot be empty")
    @Valid
    @Schema(
            description = "List of users to be registered in bulk."
    )
    private List<IndividualRegistrationDTO> users;

    @Getter
    @Setter
    public static class IndividualRegistrationDTO {
        @Email(message = "Invalid email format")
        @Schema(
                example = "user1@company.com"
        )
        private String email;

        @NotBlank(message = "Name is required")
        @Schema(
                example = "Alice Smith"
        )
        private String name;

        @Schema(
                example = "optionalPass",
                description = "If null/empty, default for candidate password."
        )
        private String password;

        @Schema(
                allowableValues = {"ADMIN", "CANDIDATE"},
                example = "CANDIDATE"
        )
        private String role;
    }
}