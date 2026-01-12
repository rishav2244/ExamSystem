package com.company.ExamBackend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class QuestionResponseDTO {
    private String id;
    private String text;
    private List<String> options;
    private String correctOption;
    private int marks;
}
