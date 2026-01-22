package com.company.ExamBackend.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CandidateResponseDTO {
    private String id;
    private String email;
    private String name;
    private String status;
    private String examTitle;
    private String examId;
}
