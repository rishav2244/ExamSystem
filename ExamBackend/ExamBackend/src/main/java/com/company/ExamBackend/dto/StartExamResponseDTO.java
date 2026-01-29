package com.company.ExamBackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StartExamResponseDTO {
    private String submissionId;
    private int duration;
}