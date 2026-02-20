package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.CreateGroupDTO;
import com.company.ExamBackend.dto.GrpMemberDTO;
import com.company.ExamBackend.dto.UserGroupResponseDTO;
import com.company.ExamBackend.model.UserGroup;

import java.util.List;

public interface UserGroupService {
    void createUserGroup(CreateGroupDTO createGroupDTO, String creatorEmail);
    List<UserGroupResponseDTO> getAllUserGroups();
    List<GrpMemberDTO> getMembersByGroupId(String groupId);
    void deleteUserGroup(String groupId);
}
