package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.CreateGroupDTO;
import com.company.ExamBackend.dto.GrpMemberDTO;
import com.company.ExamBackend.model.UserGroup;

import java.util.List;

public interface UserGroupService {
    void createUserGroup(CreateGroupDTO createGroupDTO);
    List<UserGroup> getAllUserGroups();
    List<GrpMemberDTO> getMembersByGroupId(String groupId);
    void deleteUserGroup(String groupId);
}
