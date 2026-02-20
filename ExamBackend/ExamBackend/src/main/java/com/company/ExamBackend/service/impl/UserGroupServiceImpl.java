package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.dto.CreateGroupDTO;
import com.company.ExamBackend.dto.GrpMemberDTO;
import com.company.ExamBackend.dto.UserGroupResponseDTO;
import com.company.ExamBackend.exception.EmailNotFoundException;
import com.company.ExamBackend.exception.GroupAlreadyExistsException;
import com.company.ExamBackend.exception.GroupNotFoundException;
import com.company.ExamBackend.exception.InvalidActionException;
import com.company.ExamBackend.mapper.UserGroupMapper;
import com.company.ExamBackend.model.GroupMember;
import com.company.ExamBackend.model.UserGroup;
import com.company.ExamBackend.model.Users;
import com.company.ExamBackend.repository.GroupMemberRepository;
import com.company.ExamBackend.repository.UserGroupRepository;
import com.company.ExamBackend.repository.UserRepository;
import com.company.ExamBackend.service.UserGroupService;
import lombok.AllArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
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
    public void createUserGroup(CreateGroupDTO dto, String creatorEmail) {
        validateNewGroup(dto); // Validation
        Users creator = findUserByEmail(creatorEmail); // Resolve Entities
        UserGroup savedGroup = persistGroup(dto, creator); // Persist Parent
        linkMembersToGroup(savedGroup, dto.getGroupMembers()); // Link Children
    }

    @Override
    public List<UserGroupResponseDTO> getAllUserGroups() {
        List<UserGroup> groups = userGroupRepository.findAllWithCreator();
        return userGroupMapper.toGroupResponseDTOList(groups);
    }

    @Override
    public List<GrpMemberDTO> getMembersByGroupId(String groupId) {
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        return userGroupMapper.toGrpMemberDTOList(members);
    }

    @Transactional
    @Override
    public void deleteUserGroup(String groupId) {
        UserGroup group = findGroupById(groupId);
        groupMemberRepository.deleteByGroupId(groupId);
        userGroupRepository.delete(group);
    }

    // ======================================================================================
    // Helper methods
    // ======================================================================================

    private void validateNewGroup(CreateGroupDTO dto) {
        if (userGroupRepository.existsByName(dto.getGroupName())) {
            throw new GroupAlreadyExistsException("Group name '" + dto.getGroupName() + "' is already taken.");
        }
        if (dto.getGroupMembers() == null || dto.getGroupMembers().isEmpty()) {
            throw new InvalidActionException("A group must have at least one candidate.");
        }
    }

    private Users findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EmailNotFoundException("User not found: " + email));
    }

    private UserGroup findGroupById(String id) {
        return userGroupRepository.findById(id)
                .orElseThrow(() -> new GroupNotFoundException("Group not found with ID: " + id));
    }

    private UserGroup persistGroup(CreateGroupDTO dto, Users creator) {
        UserGroup userGroup = userGroupMapper.toUserGroupEntity(dto, creator);
        return userGroupRepository.save(userGroup);
    }

    private void linkMembersToGroup(UserGroup group, List<String> memberEmails) {
        List<Users> users = userRepository.findAllByEmailIn(memberEmails);
        List<GroupMember> membersList = userGroupMapper.toMemberEntities(group, users);
        groupMemberRepository.saveAll(membersList);
    }
}
