package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.*;
import com.company.ExamBackend.model.UserGroup;
import org.springframework.data.domain.Page;

import java.util.List;

public interface UserGroupService {
    CreateGroupResponseDTO createUserGroup(CreateGroupDTO dto, String creatorEmail);
    Page<UserGroupResponseDTO> getAllUserGroups(String adminEmail, int page, int size);
    Page<GrpMemberDTO> getMembersByGroupId(String adminEmail, String groupId, int page, int size);
    Page<GrpMemberDTO> searchMember(
            String adminEmail,
            GrpMemberSearchDTO grpMemberSearchDTO,
            String groupId,
            int page,
            int size
    );
    void deleteUserGroup(String groupId);
}
