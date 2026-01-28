package com.company.ExamBackend.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class StartExamRequestDTO {
    private String examId;
    private String candidateName;
    private String candidateEmail;
    private String location;
}