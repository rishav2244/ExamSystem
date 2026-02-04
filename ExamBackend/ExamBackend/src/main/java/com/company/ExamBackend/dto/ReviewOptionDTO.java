package com.company.ExamBackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewOptionDTO {
    private String id;
    private int optionIndex;
    private String text;
    private boolean isCorrect;
}