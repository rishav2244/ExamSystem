package com.company.ExamBackend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class QuestionResultDTO {
    private String questionId;
    private String questionText;
    private int marks;
    private List<ReviewOptionDTO> options;
    private String selectedOptionId;
    private boolean isCorrect;
}