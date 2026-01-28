package com.company.ExamBackend.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
public class CandidateDashboardDTO {
    private String examId;
    private String title;
    private int duration;
    private Instant startTime;
    private Instant endTime;
    private String candidateStatus;
}