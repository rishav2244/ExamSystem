package com.company.ExamBackend.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CandidateResultObj {
    private String examTitle;
    private String name;
    private String email;
    private Double score;
    private boolean passed;
    private String examId;
}
