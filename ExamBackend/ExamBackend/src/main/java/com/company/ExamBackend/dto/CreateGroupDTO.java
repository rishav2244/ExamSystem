package com.company.ExamBackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateGroupDTO {

    @Schema(
            example = "Class 6E",
            description = "Name of group to be created."
    )
    private String groupName;

    @Schema(
            description = "Emails of group members."
    )
    private List<String> groupMembers;
}
