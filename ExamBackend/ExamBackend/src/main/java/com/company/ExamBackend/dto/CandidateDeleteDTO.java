package com.company.ExamBackend.dto;


import lombok.Builder;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
@Builder
public class CandidateDeleteDTO {
    String examId;
    String email;
}

