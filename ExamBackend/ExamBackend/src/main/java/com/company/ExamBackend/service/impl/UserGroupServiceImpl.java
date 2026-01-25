package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.dto.CreateGroupDTO;
import com.company.ExamBackend.dto.GrpMemberDTO;
import com.company.ExamBackend.exception.EmailNotFoundException;
import com.company.ExamBackend.exception.GroupNotFoundException;
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

    @Transactional
    @Override
    public void createUserGroup(CreateGroupDTO createGroupDTO){
        UserGroup userGroup = new UserGroup();
        userGroup.setName(createGroupDTO.getGroupName());
        Users user = userRepository.findByEmail(createGroupDTO.getCreatorMail()).orElseThrow(() -> new EmailNotFoundException("Email not found"));
        userGroup.setCreatedBy(user);
        UserGroup savedGroup = userGroupRepository.save(userGroup);

        List<Users> candidates = userRepository.findAllByEmailIn(createGroupDTO.getGroupMembers());

        List<GroupMember> membersList = candidates.stream()
                .filter(u -> "CANDIDATE".equalsIgnoreCase(u.getRole()))
                .map(u -> {
                    GroupMember member = new GroupMember();
                    member.setGroup(savedGroup);
                    member.setUser(u);
                    return member;
                })
                .toList();

        groupMemberRepository.saveAll(membersList);
    }

    @Override
    public List<UserGroup> getAllUserGroups() {
        return userGroupRepository.findAll();
    }

    @Override
    public List<GrpMemberDTO> getMembersByGroupId(String groupId) {
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);

        return members.stream().map(m -> {
            GrpMemberDTO dto = new GrpMemberDTO();

            dto.setId(m.getUser().getId());
            dto.setName(m.getUser().getName());
            dto.setEmail(m.getUser().getEmail());

            return dto;
        }).toList();
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
