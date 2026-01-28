package com.company.ExamBackend.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class CandidateQuestionDTO {
    private String id;
    private String text;
    private int marks;
    private List<CandidateOptionDTO> options;
}