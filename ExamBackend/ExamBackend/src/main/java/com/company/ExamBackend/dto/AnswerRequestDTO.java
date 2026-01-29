package com.company.ExamBackend.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerRequestDTO {
    private String submissionId;
    private String questionId;
    private String optionId;
}