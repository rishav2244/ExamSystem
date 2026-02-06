package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.dto.CreateGroupDTO;
import com.company.ExamBackend.dto.GrpMemberDTO;
import com.company.ExamBackend.dto.UserGroupResponseDTO;
import com.company.ExamBackend.exception.EmailNotFoundException;
import com.company.ExamBackend.exception.GroupNotFoundException;
import com.company.ExamBackend.mapper.UserGroupMapper;
import com.company.ExamBackend.model.GroupMember;
import com.company.ExamBackend.model.UserGroup;
import com.company.ExamBackend.model.Users;
import com.company.ExamBackend.repository.GroupMemberRepository;
import com.company.ExamBackend.repository.UserGroupRepository;
import com.company.ExamBackend.repository.UserRepository;
import com.company.ExamBackend.service.UserGroupService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class UserGroupServiceImpl  implements UserGroupService {

    private UserGroupRepository userGroupRepository;
    private UserRepository userRepository;
    private GroupMemberRepository groupMemberRepository;
    private UserGroupMapper  userGroupMapper;

    @Transactional
    @Override
    public void createUserGroup(CreateGroupDTO createGroupDTO) {
        Users creator = userRepository.findByEmail(createGroupDTO.getCreatorMail())
                .orElseThrow(() -> new EmailNotFoundException("Email not found"));

        UserGroup userGroup = userGroupMapper.toUserGroupEntity(createGroupDTO, creator);
        UserGroup savedGroup = userGroupRepository.save(userGroup);

        List<Users> candidates = userRepository.findAllByEmailIn(createGroupDTO.getGroupMembers());

        List<GroupMember> membersList = candidates.stream()
                .filter(u -> "CANDIDATE".equalsIgnoreCase(u.getRole()))
                .map(u -> userGroupMapper.toGroupMemberEntity(savedGroup, u))
                .toList();

        groupMemberRepository.saveAll(membersList);
    }

    @Override
    public List<UserGroupResponseDTO> getAllUserGroups() {
        return userGroupRepository.findAll()
                .stream()
                .map(userGroupMapper::toGroupResponseDTO)
                .toList();
    }

    @Override
    public List<GrpMemberDTO> getMembersByGroupId(String groupId) {
        return groupMemberRepository.findByGroupId(groupId)
                .stream()
                .map(userGroupMapper::toGrpMemberDTO) // Clean one-liner
                .toList();
    }

    @Transactional
    @Override
    public void deleteUserGroup(String groupId) {

        UserGroup group = userGroupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException("Group not found"));
        groupMemberRepository.deleteByGroupId(groupId);
        userGroupRepository.delete(group);
    }
}
