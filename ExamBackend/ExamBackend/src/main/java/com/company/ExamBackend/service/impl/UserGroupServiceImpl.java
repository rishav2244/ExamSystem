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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    public Page<UserGroupResponseDTO> getAllUserGroups(String adminEmail, int page, int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "name");
        Pageable pageable = PageRequest.of(page, size, sort);
        return userGroupRepository.findByCreatedBy_Email(adminEmail, pageable)
                .map(userGroupMapper::toGroupResponseDTO);
    }

    @Override
    public Page<GrpMemberDTO> getMembersByGroupId(String adminEmail, String groupId, int page, int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "gm.user.name");
        Pageable pageable = PageRequest.of(page, size, sort);
        return groupMemberRepository.findByGroupId(groupId, adminEmail, pageable)
                .map(userGroupMapper::toGrpMemberDTO);
    }

    @Override
    public Page<GrpMemberDTO> searchMember(
            String adminEmail,
            GrpMemberSearchDTO grpMemberSearchDTO,
            String groupId,
            int page,
            int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "gm.user.name");
        Pageable pageable = PageRequest.of(page, size, sort);
        return groupMemberRepository.searchByQueryAndGroupId(
                grpMemberSearchDTO.getQuery(),
                        groupId,
                        adminEmail,
                        pageable)
                .map(userGroupMapper::toGrpMemberDTO);
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
        Set<String> potentiallyValid = new HashSet<>();

        for (String email : rawEmails) {
            if (email == null) continue;

            String cleanEmail = email.trim().toLowerCase();

            if (isInvalidEmailFormat(cleanEmail)) {
                failures.add(createFailure(email, "Invalid email format"));
            } else {
                potentiallyValid.add(cleanEmail);
            }
        }

        List<Users> existingUsers = userRepository.findAllByEmailIn(new ArrayList<>(potentiallyValid));

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

        potentiallyValid.stream()
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

    private boolean isInvalidEmailFormat(String email) {
        String regex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        return email == null || !email.matches(regex);
    }
}
