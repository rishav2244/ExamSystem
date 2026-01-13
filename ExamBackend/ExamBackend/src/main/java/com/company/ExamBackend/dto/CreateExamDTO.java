package com.company.ExamBackend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class CreateExamDTO {
    private String title;
    private int duration;
    private Instant startTime;
    private Instant endTime;
    private String status;
    private String createdBy;
}
