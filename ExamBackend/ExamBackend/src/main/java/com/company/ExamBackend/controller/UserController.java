package com.company.ExamBackend.controller;

import com.company.ExamBackend.dto.*;
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
    public ResponseEntity<UserResponseDTO> userLogin(@RequestBody LoginRequestDTO loginRequestDTO) {
        UserResponseDTO responseDTO = userService.loginAttempt(loginRequestDTO);

        String token = userService.getToken(loginRequestDTO.getEmail());
        return ResponseEntity.ok()
                .header("Authorization", "Bearer " + token)
                .header("Access-Control-Expose-Headers", "Authorization") // Let React see this header
                .body(responseDTO);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody PasswordResetDTO passwordResetDTO) {
        userService.resetPassword(passwordResetDTO);
        return ResponseEntity.ok("Password updated successfully.");
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