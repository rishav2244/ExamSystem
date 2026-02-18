package com.company.ExamBackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SavedAnswerDTO {
    private String questionId;
    private String selectedOptionId;
}