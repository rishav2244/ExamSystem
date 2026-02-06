package com.company.ExamBackend.mapper;

import com.company.ExamBackend.dto.CreateGroupDTO;
import com.company.ExamBackend.dto.GrpMemberDTO;
import com.company.ExamBackend.dto.UserGroupResponseDTO;
import com.company.ExamBackend.model.GroupMember;
import com.company.ExamBackend.model.UserGroup;
import com.company.ExamBackend.model.Users;
import org.springframework.stereotype.Component;

@Component
public class UserGroupMapper {

    public UserGroup toUserGroupEntity(CreateGroupDTO dto, Users creator) {
        UserGroup userGroup = new UserGroup();
        userGroup.setName(dto.getGroupName());
        userGroup.setCreatedBy(creator);
        return userGroup;
    }

    public GroupMember toGroupMemberEntity(UserGroup group, Users user) {
        GroupMember member = new GroupMember();
        member.setGroup(group);
        member.setUser(user);
        return member;
    }

    public GrpMemberDTO toGrpMemberDTO(GroupMember groupMember) {
        GrpMemberDTO dto = new GrpMemberDTO();
        Users user = groupMember.getUser();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        return dto;
    }

    public UserGroupResponseDTO toGroupResponseDTO(UserGroup group) {
        UserGroupResponseDTO dto = new UserGroupResponseDTO();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setCreatorName(group.getCreatedBy().getName());
        return dto;
    }
}