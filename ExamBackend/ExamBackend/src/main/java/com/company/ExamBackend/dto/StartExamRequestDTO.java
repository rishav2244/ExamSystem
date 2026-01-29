package com.company.ExamBackend.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartExamRequestDTO {
    private String examId;
    private String candidateName;
    private String candidateEmail;
    private String location;
}