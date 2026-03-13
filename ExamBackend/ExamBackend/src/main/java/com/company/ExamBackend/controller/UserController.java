package com.company.ExamBackend.controller;

import com.company.ExamBackend.dto.*;
import com.company.ExamBackend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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
            summary = "Register new users (Admin side)",
            description = "Used by admin to register new users, usually from a list of users."
    )
    @PostMapping("/bulk-register")
    public ResponseEntity<BulkRegistrationSummaryDTO> adminUserRegister(
            @Valid @RequestBody AdminRegisterRequestDTO registerRequestDTO) {

        BulkRegistrationSummaryDTO summary = userService.adminRegisterAttempt(registerRequestDTO);
        return ResponseEntity.status(201).body(summary);
    }

    @Operation(
            summary = "Register new user (Candidate side)",
            description = "Initiates registration and returns metadata for the frontend timers."
    )
    @PostMapping("/self-register")
    public ResponseEntity<RegistrationResponseDTO> candidateUserRegister(
            @Valid @RequestBody CandidateRegisterRequestDTO registerRequestDTO) {

        RegistrationResponseDTO response = userService.candidateRegisterAttempt(registerRequestDTO);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Verify OTP",
            description = "Verifies the OTP and promotes the candidate to a full user."
    )
    @PostMapping("/verify-otp")
    public ResponseEntity<UserResponseDTO> verifyOtp(@Valid @RequestBody VerifyOtpRequestDTO verifyRequestDTO) {
        UserResponseDTO response = userService.verifyRegistration(verifyRequestDTO);
        return ResponseEntity.status(201).body(response);
    }

    @Operation(
            summary = "Resend OTP",
            description = "Generates a new OTP if the resend-delay has passed."
    )
    @PostMapping("/resend-otp")
    public ResponseEntity<ResendResponseDTO> resendOtp(@RequestParam String email) {
        ResendResponseDTO response = userService.resendOtp(email);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Authenticate user",
            description = "Returns user details and both Access/Refresh tokens in the body."
    )
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> userLogin(@RequestBody LoginRequestDTO loginRequestDTO) {
        return ResponseEntity.ok(userService.loginAttempt(loginRequestDTO));
    }

    @Operation(
            summary = "Logout user",
            description = "Revokes the refresh token so it can no longer be used."
    )
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@AuthenticationPrincipal UserDetails userDetails) {
        userService.logout(userDetails.getUsername());
        return ResponseEntity.ok("Logged out successfully.");
    }

    @Operation(
            summary = "Refresh Token",
            description = "Provides a new Access Token using a valid Refresh Token."
    )
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDTO> refresh(@RequestBody RefreshTokenRequestDTO request) {
        return ResponseEntity.ok(userService.refreshAccessToken(request.getRefreshToken()));
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