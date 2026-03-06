package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@Schema(
        description = "Detailed response of group creation including specific failure reasons per email."
)
public class CreateGroupResponseDTO {

    @Schema(
            example = "Class 6E"
    )
    private String groupName;

    @Schema(
            example = "Group created. Some users were excluded due to role mismatches or missing accounts."
    )
    private String message;

    @Schema(
            description = "List of specific emails and the reasons they were rejected."
    )
    private List<GroupEmailFailureDTO> failedUsers;

    @Schema(example = "480")
    private int totalAdded;
}