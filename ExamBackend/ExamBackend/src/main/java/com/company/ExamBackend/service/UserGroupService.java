package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.CreateGroupDTO;
import com.company.ExamBackend.dto.CreateGroupResponseDTO;
import com.company.ExamBackend.dto.GrpMemberDTO;
import com.company.ExamBackend.dto.UserGroupResponseDTO;
import com.company.ExamBackend.model.UserGroup;

import java.util.List;

public interface UserGroupService {
    CreateGroupResponseDTO createUserGroup(CreateGroupDTO dto, String creatorEmail);
    List<UserGroupResponseDTO> getAllUserGroups(String adminEmail);
    List<GrpMemberDTO> getMembersByGroupId(String groupId);
    void deleteUserGroup(String groupId);
}
