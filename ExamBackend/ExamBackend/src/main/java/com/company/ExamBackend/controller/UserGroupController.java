package com.company.ExamBackend.controller;

import com.company.ExamBackend.dto.CreateGroupDTO;
import com.company.ExamBackend.dto.CreateGroupResponseDTO;
import com.company.ExamBackend.dto.GrpMemberDTO;
import com.company.ExamBackend.dto.UserGroupResponseDTO;
import com.company.ExamBackend.service.UserGroupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/userGroups")
@Tag(
        name = "User groups management",
        description = "Endpoints for managing user groups."
)
public class UserGroupController {

    private final UserGroupService userGroupService;

    @Operation(
            summary = "Creates a new group",
            description = "Used by admin to create a new group. Returns a report of successes and failures."
    )
    @PostMapping("/create")
    public ResponseEntity<CreateGroupResponseDTO> createGroup(
            @RequestBody CreateGroupDTO createGroupDTO,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        CreateGroupResponseDTO response = userGroupService.createUserGroup(createGroupDTO, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @GetMapping("")
    @Operation(
            summary = "Gets all groups",
            description = "Used by admin to create new user."
    )
    public ResponseEntity<List<UserGroupResponseDTO>> getAllUserGroups(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userGroupService.getAllUserGroups(userDetails.getUsername()));
    }

    @Operation(
            summary = "Gets list of users in a group",
            description = "Used by admin list users from group."
    )
    @GetMapping("/userList/{groupId}")
    public ResponseEntity<List<GrpMemberDTO>> getAllUsersByGroupId(@PathVariable String groupId) {
        return ResponseEntity.ok(userGroupService.getMembersByGroupId(groupId));
    }

    @Operation(
            summary = "Deletes a group",
            description = "Used by admin to delete a group."
    )
    @DeleteMapping("/delete/{groupId}")
    public ResponseEntity<Void> deleteUserGroup(@PathVariable String groupId) {
        userGroupService.deleteUserGroup(groupId);
        return ResponseEntity.noContent().build();
    }
}
