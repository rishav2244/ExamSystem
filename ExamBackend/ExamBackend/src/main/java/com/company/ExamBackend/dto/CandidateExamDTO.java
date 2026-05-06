package com.company.ExamBackend.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
public class CandidateExamDTO {
    private String id;
    private String title;
    private int duration;
    private Instant startTime; // Submission's createdAt
    private Instant endTime;   // Exam's endTime
    private List<CandidateQuestionDTO> questions;
    private String submissionId;
}