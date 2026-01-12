package com.company.ExamBackend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class QuestionDTO {

    private String text;
    private List<String> options;
    private String correctOption;
    private int marks;
}