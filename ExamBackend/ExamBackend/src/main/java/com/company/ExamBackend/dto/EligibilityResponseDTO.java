package com.company.ExamBackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class EligibilityResponseDTO {
    private boolean eligible;
    private String action;
    private String submissionId;
}