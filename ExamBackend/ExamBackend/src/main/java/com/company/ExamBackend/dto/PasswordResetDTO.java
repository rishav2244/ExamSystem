package com.company.ExamBackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordResetDTO {
    private String email;
    private String oldPassword;
    private String newPassword;
}