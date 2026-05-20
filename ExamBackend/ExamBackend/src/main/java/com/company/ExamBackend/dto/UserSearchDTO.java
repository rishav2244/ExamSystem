package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UserSearchDTO {

    @Schema(
            description = "Text to be queried.",
            example = "candidate@te"
    )
    String searchQuery;
}
