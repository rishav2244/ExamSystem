package com.company.ExamBackend.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ResultMailResponseDTO {

    private List<EmailFailure> emailInfo = new ArrayList<>();

    private Long attempted = 0L;

    private Long failed;
}
