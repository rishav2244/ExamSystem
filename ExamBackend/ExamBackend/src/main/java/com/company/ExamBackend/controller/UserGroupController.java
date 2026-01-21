package com.company.ExamBackend.controller;

import com.company.ExamBackend.dto.CreateGroupDTO;
import com.company.ExamBackend.service.UserGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
