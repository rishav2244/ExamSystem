package com.company.ExamBackend.controller;

import com.company.ExamBackend.dto.LoginRequestDTO;
import com.company.ExamBackend.dto.RegisterRequestDTO;
import com.company.ExamBackend.dto.UserHeavyDTO;
import com.company.ExamBackend.dto.UserResponseDTO;
import com.company.ExamBackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/register")
    public UserResponseDTO userRegister(@RequestBody RegisterRequestDTO registerRequestDTO) {
        return userService.registerAttempt(registerRequestDTO);
    }

    @PostMapping("/login")
    public UserResponseDTO userLogin(@RequestBody LoginRequestDTO loginRequestDTO) {
        return userService.loginAttempt(loginRequestDTO);
    }

    @GetMapping("/candidates")
    public ResponseEntity<List<UserHeavyDTO>> getCandidates() {
        return ResponseEntity.ok(userService.getCandidates());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserHeavyDTO>> getUsers() {
        return ResponseEntity.ok(userService.getUsers());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserHeavyDTO> getUser(@PathVariable String userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }
}