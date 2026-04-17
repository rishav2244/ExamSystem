package com.company.ExamBackend.controller;

import com.company.ExamBackend.dto.*;
import com.company.ExamBackend.service.UserGroupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
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
    public ResponseEntity<Page<UserGroupResponseDTO>> getAllUserGroups(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return ResponseEntity.ok(userGroupService.getAllUserGroups(userDetails.getUsername(), page, size));
    }

    @Operation(
            summary = "Gets list of users in a group",
            description = "Used by admin list users from group."
    )
    @GetMapping("/userList/{groupId}")
    public ResponseEntity<Page<GrpMemberDTO>> getAllUsersByGroupId(
            @PathVariable String groupId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userGroupService.getMembersByGroupId(userDetails.getUsername(), groupId, page, size));
    }

    @Operation(
            summary = "Search for group",
            description = "Searches for group based on query."
    )
    @PostMapping("/userList/search")
    public ResponseEntity<Page<UserGroupResponseDTO>> searchGroup(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestBody GrpSearchDTO grpSearchDTO,
            @AuthenticationPrincipal UserDetails userDetails
    ){
        return ResponseEntity.ok(
                userGroupService.searchGroup(
                        userDetails.getUsername(),
                        grpSearchDTO,
                        page,
                        size
                        )
        );
    }

    @Operation(
            summary = "Search for group member",
            description = "Searches for user from group based on query."
    )
    @PostMapping("/userList/searcg/{groupId}")
    public ResponseEntity<Page<GrpMemberDTO>> searchGroupMember(
            @PathVariable String groupId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestBody GrpMemberSearchDTO grpMemberSearchDTO,
            @AuthenticationPrincipal UserDetails userDetails
    ){
        return ResponseEntity.ok(
                userGroupService.searchMember(
                        userDetails.getUsername(),
                        grpMemberSearchDTO,
                        groupId,
                        page,
                        size
                )
        );
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
