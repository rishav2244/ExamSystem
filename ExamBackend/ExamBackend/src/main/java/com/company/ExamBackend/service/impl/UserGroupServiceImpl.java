package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.dto.*;
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

import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class UserGroupServiceImpl  implements UserGroupService {

    private UserGroupRepository userGroupRepository;
    private UserRepository userRepository;
    private GroupMemberRepository groupMemberRepository;
    private UserGroupMapper  userGroupMapper;

    @Transactional
    @Override
    public CreateGroupResponseDTO createUserGroup(CreateGroupDTO dto, String creatorEmail) {
        validateNewGroup(dto, creatorEmail);

        Users creator = findUserByEmail(creatorEmail);

        List<GroupEmailFailureDTO> failures = new ArrayList<>();
        List<Users> validCandidates = auditAndCategorizeMembers(dto.getGroupMembers(), failures);

        if (validCandidates.isEmpty()) {
            throw new InvalidActionException("Group creation failed: No valid 'CANDIDATE' users found.");
        }

        UserGroup savedGroup = persistGroup(dto, creator);
        saveGroupMembers(savedGroup, validCandidates);

        return CreateGroupResponseDTO.builder()
                .groupName(savedGroup.getName())
                .totalAdded(validCandidates.size())
                .failedUsers(failures)
                .message(failures.isEmpty() ? "Group created successfully." : "Group created with some exclusions.")
                .build();
    }

    @Override
    public List<UserGroupResponseDTO> getAllUserGroups(String adminEmail) {
        return userGroupRepository.findByCreatedBy_Email(adminEmail)
                .stream()
                .map(userGroupMapper::toGroupResponseDTO)
                .toList();
    }

    @Override
    public List<GrpMemberDTO> getMembersByGroupId(String groupId) {
        return groupMemberRepository.findByGroupId(groupId)
                .stream()
                .map(userGroupMapper::toGrpMemberDTO)
                .toList();
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

    private List<Users> auditAndCategorizeMembers(List<String> rawEmails, List<GroupEmailFailureDTO> failures) {
        // Java 17: Create a unique set of lowercased emails
        var uniqueEmails = rawEmails.stream()
                .filter(Objects::nonNull)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        List<Users> existingUsers = userRepository.findAllByEmailIn(uniqueEmails.stream().toList());

        var foundEmails = existingUsers.stream()
                .map(user -> user.getEmail().toLowerCase())
                .collect(Collectors.toSet());

        List<Users> validCandidates = new ArrayList<>();
        for (Users user : existingUsers) {
            if ("CANDIDATE".equalsIgnoreCase(user.getRole())) {
                validCandidates.add(user);
            } else {
                failures.add(createFailure(user.getEmail(), "Invalid role: " + user.getRole()));
            }
        }

        uniqueEmails.stream()
                .filter(email -> !foundEmails.contains(email))
                .map(email -> createFailure(email, "User not found"))
                .forEach(failures::add);

        return validCandidates;
    }

    private void saveGroupMembers(UserGroup group, List<Users> candidates) {
        List<GroupMember> membersList = userGroupMapper.toMemberEntities(group, candidates);
        groupMemberRepository.saveAll(membersList);
    }

    private GroupEmailFailureDTO createFailure(String email, String reason) {
        return GroupEmailFailureDTO.builder()
                .email(email)
                .reason(reason)
                .build();
    }

    private void validateNewGroup(CreateGroupDTO dto, String creatorEmail) {
        if (userGroupRepository.existsByNameAndCreatedBy_Email(dto.getGroupName(), creatorEmail)) {
            throw new GroupAlreadyExistsException("You already have a group named '" + dto.getGroupName() + "'");
        }
        if (dto.getGroupMembers() == null || dto.getGroupMembers().isEmpty()) {
            throw new InvalidActionException("A group must have at least one candidate.");
        }
    }

    private UserGroup persistGroup(CreateGroupDTO dto, Users creator) {
        UserGroup userGroup = userGroupMapper.toUserGroupEntity(dto, creator);
        return userGroupRepository.save(userGroup);
    }

    private Users findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EmailNotFoundException("User not found: " + email));
    }

    private UserGroup findGroupById(String id) {
        return userGroupRepository.findById(id)
                .orElseThrow(() -> new GroupNotFoundException("Group not found with ID: " + id));
    }
}
