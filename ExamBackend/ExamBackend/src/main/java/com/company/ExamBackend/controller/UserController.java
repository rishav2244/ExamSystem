package com.company.ExamBackend.controller;

import com.company.ExamBackend.dto.*;
import com.company.ExamBackend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Tag(
        name = "User Management",
        description = "Endpoints for authentication and user profile operations"
)
public class UserController {
    private final UserService userService;

    @Operation(
            summary = "Register a new user",
            description = "Used by admin to create new user."
    )
    @PostMapping("/register")
    public UserResponseDTO userRegister(@RequestBody RegisterRequestDTO registerRequestDTO) {
        return userService.registerAttempt(registerRequestDTO);
    }

    @Operation(
            summary = "Authenticate user",
            description = "Returns user details and a JWT in the Authorization header."
    )
    @PostMapping("/login")
    public ResponseEntity<UserResponseDTO> userLogin(@RequestBody LoginRequestDTO loginRequestDTO) {
        UserResponseDTO responseDTO = userService.loginAttempt(loginRequestDTO);

        String token = userService.getToken(loginRequestDTO.getEmail());
        return ResponseEntity.ok()
                .header("Authorization", "Bearer " + token)
                .header("Access-Control-Expose-Headers", "Authorization")
                .body(responseDTO);
    }

    @Operation(
            summary = "Reset password",
            description = "Allows an authenticated user to change their password."
    )
    @SecurityRequirement(name = "bearerAuth") // Since email is extracted via token authentication.
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestBody PasswordResetDTO passwordResetDTO,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        userService.resetPassword(userDetails.getUsername(), passwordResetDTO);
        return ResponseEntity.ok("Password updated successfully.");
    }

    @Operation(
            summary = "List all candidates",
            description = "Fetches all users with the role CANDIDATE. Admin access required.")
    @GetMapping("/candidates")
    public ResponseEntity<List<UserHeavyDTO>> getCandidates() {
        return ResponseEntity.ok(userService.getCandidates());
    }

    @Operation(
            summary = "Lists all users",
            description = "Lists all users regardless of role.")
    @GetMapping("/users")
    public ResponseEntity<List<UserHeavyDTO>> getUsers() {
        return ResponseEntity.ok(userService.getUsers());
    }

    @Operation(
            summary = "Gets details of a specific user.",
            description = "Gets details a specific user. " +
                    "Currently no extra details are shown since there isn't much to show " +
                    "in the first place."
    )
    @GetMapping("/{userId}")
    public ResponseEntity<UserHeavyDTO> getUser(@PathVariable String userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }
}