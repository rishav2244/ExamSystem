package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Value;

@Value
@Getter
public class UserSearchDTO {

    @Schema(
            description = "Text to be queried.",
            example = "candidate@te"
    )
    String searchQuery;
}
