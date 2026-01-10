package com.company.ExamBackend.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class RegisterRequestDTO
{
    private String email;
    private String name;
    private String password;
    private String role;
}
