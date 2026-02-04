package com.company.ExamBackend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SubmissionDetailsDTO {
    private String submissionId;
    private String candidateName;
    private float totalScore;
    private List<QuestionResultDTO> questions;
}