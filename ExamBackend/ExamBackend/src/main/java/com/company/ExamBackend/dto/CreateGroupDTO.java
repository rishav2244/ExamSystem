package com.company.ExamBackend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateGroupDTO {
    private String groupName;
    private String creatorMail;
    private List<String> groupMembers;
}
