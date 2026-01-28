package com.company.ExamBackend.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class CandidateExamDTO {
    private String id;
    private String title;
    private int duration; // in minutes
    private List<CandidateQuestionDTO> questions;
}