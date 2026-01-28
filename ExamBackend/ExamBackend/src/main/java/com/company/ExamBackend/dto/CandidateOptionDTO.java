package com.company.ExamBackend.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CandidateOptionDTO {
    private String id;
    private String text;
    private int optionIndex;
}