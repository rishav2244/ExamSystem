package com.company.ExamBackend.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@Builder
public class QuestionResponseDTO {
    private String id;
    private String text;
    private int marks;
    private int correctOptionIndex;     // 0,1,2,3...
    private List<OptionResponseDTO> options;
}