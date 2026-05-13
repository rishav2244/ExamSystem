package com.company.ExamBackend.dto;

import lombok.*;

@Getter
@Setter
@Builder
public class ResetAttemptResponseDTO {
    private boolean success ;
    private int attemptsLeft ;
}
