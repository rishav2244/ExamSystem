package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class CandidateSubmissionsOverviewDTO {

    List<CandidateSubmissionDetailDTO>  candidateSubmissionDetailDTO = new ArrayList<>();;
}
