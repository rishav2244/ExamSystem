package com.company.ExamBackend.controller;

import com.company.ExamBackend.dto.CreateGroupDTO;
import com.company.ExamBackend.dto.GrpMemberDTO;
import com.company.ExamBackend.model.UserGroup;
import com.company.ExamBackend.service.UserGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/userGroups")
public class UserGroupController {

    private final UserGroupService userGroupService;

    @PostMapping("create")
    public ResponseEntity<Void> createUser(@RequestBody CreateGroupDTO createGroupDTO) {
        userGroupService.createUserGroup(createGroupDTO);
        return ResponseEntity.ok().build();
    }

    @GetMapping("")
    public ResponseEntity<List<UserGroup>> getAllUserGroups() {
        return ResponseEntity.ok(userGroupService.getAllUserGroups());
    }

    @GetMapping("/userList/{groupId}")
    public ResponseEntity<List<GrpMemberDTO>> getAllUserGroupsByGroupId(@PathVariable String groupId) {
        return ResponseEntity.ok(userGroupService.getMembersByGroupId(groupId));
    }

    @DeleteMapping("/delete/{groupId}")
    public ResponseEntity<Void> deleteUserGroup(@PathVariable String groupId) {
        userGroupService.deleteUserGroup(groupId);
        return ResponseEntity.noContent().build();
    }
}
