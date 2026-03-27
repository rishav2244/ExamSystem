package com.company.ExamBackend.controller;

import com.company.ExamBackend.dto.CandidateResponseDTO;
import com.company.ExamBackend.dto.CreateExamDTO;
import com.company.ExamBackend.dto.ExamResponseDTO;
import com.company.ExamBackend.mapper.CandidateMapper;
import com.company.ExamBackend.model.ExamCandidate;
import com.company.ExamBackend.service.ExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
@AllArgsConstructor
@Tag(
        name = "Exam Management",
        description = "Endpoints for Exam management."
)
public class ExamController {

    private final ExamService examService;

    @Operation(
            summary = "Creates a new exam",
            description = "Used by admin to create new exam."
    )
    @PostMapping("/createExam")
    public ResponseEntity<ExamResponseDTO> createExam(
            @RequestBody CreateExamDTO createExamDTO,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Pass the verified email from the token
        return ResponseEntity.ok(examService.createExam(createExamDTO, userDetails.getUsername()));
    }

    //Gets all exams for the admin. May accept exam status if we want only one type later.
    @Operation(
            summary = "Fetches all exams",
            description = "Used by admin to fetch all exams."
    )
    @GetMapping("/getExams")
    public ResponseEntity<Page<ExamResponseDTO>> getExams(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {

        String adminEmail = userDetails.getUsername();

        if (status != null && !status.isEmpty()) {
            return ResponseEntity.ok(examService.getExamsByStatus(status, adminEmail, page, size));
        }

        return ResponseEntity.ok(examService.getExams(adminEmail, page, size));
    }

    //Publishes exam.
    @Operation(
            summary = "Publishes an exam",
            description = "Used by admin to publish an exam."
    )
    @PostMapping("/publishExam/{examId}")
    public ResponseEntity<String> publishExam(@PathVariable String examId) {
        examService.updateExam(examId, "PUBLISHED");
        return ResponseEntity.ok("Exam published");
    }

    //Assigns candidates from group to Exam. Creates ExamCandidate entries.
    @Operation(
            summary = "Assigns candidates to exams",
            description = "Used by admin to assign candidates of a group to exam."
    )
    @PostMapping("/Candidates/{examId}/{groupId}")
    public ResponseEntity<List<CandidateResponseDTO>> setCandidate(@PathVariable String examId, @PathVariable String groupId) {
        return ResponseEntity.ok(examService.assignGroupToExam(groupId, examId));
    }

    //Deletes exam.
    @Operation(
            summary = "Deletes an exam",
            description = "Used by admin to delete an exam."
    )
    @DeleteMapping("/delete/{examId}")
    public ResponseEntity<Void> deleteExam(
            @PathVariable String examId,
            @AuthenticationPrincipal UserDetails userDetails) {

        examService.deleteExam(examId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    //Resend functionalities for uninvited candidates due to some reason.
    @Operation(
            summary = "Resends email invite",
            description = "Used by admin to resend email invite, usually failed ones."
    )
    @PostMapping("/candidates/resend-invitation/{candidateId}")
    public ResponseEntity<String> resendInvitation(@PathVariable String candidateId) {
        examService.resendInvitation(candidateId);
        return ResponseEntity.ok("Invitation resent successfully");
    }
}