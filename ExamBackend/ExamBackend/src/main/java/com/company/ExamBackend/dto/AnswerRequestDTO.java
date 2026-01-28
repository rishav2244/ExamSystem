package com.company.ExamBackend.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class AnswerRequestDTO {
    private String submissionId;
    private String questionId;
    private String optionId;
}