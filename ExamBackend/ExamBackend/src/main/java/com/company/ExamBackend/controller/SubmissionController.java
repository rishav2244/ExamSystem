package com.company.ExamBackend.controller;

import com.company.ExamBackend.dto.ResultMailResponseDTO;
import com.company.ExamBackend.dto.SubmissionDetailsDTO;
import com.company.ExamBackend.dto.SubmissionResponseDTO;
import com.company.ExamBackend.dto.SubmissionsOverviewDTO;
import com.company.ExamBackend.service.SubmissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
@Tag(
        name = "Submission Management",
        description = "Endpoints for submission management (Admin side)."
)
public class SubmissionController {

    private final SubmissionService submissionService;

    @GetMapping("/exam/{examId}")
    @Operation(
            summary = "Gets submissions for an exam",
            description = "Returns all submissions of an exam with light details."
    )
    public ResponseEntity<List<SubmissionResponseDTO>> getExamSubmissions(
            @PathVariable String examId,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<SubmissionResponseDTO> submissions = submissionService.getSubmissionsByExam(examId, userDetails.getUsername());
        return ResponseEntity.ok(submissions);
    }

    @Operation(
            summary = "Gets details of a submission.",
            description = "Returns details of candidate's exam"
    )
    @GetMapping("/{submissionId}")
    public ResponseEntity<SubmissionDetailsDTO> getSubmissionDetails(
            @PathVariable String submissionId,
            @AuthenticationPrincipal UserDetails userDetails) {

        var details = submissionService.getSubmissionDetails(submissionId, userDetails.getUsername());
        return ResponseEntity.ok(details);
    }

    @Operation(
            summary = "All submissions overview.",
            description = "Gets overall details of all submissions"
    )
    @GetMapping("/overview")
    public ResponseEntity<SubmissionsOverviewDTO> getSubmissionsOverview(
            @AuthenticationPrincipal UserDetails userDetails) {

        var details = submissionService.getSubmissionsOverview(userDetails.getUsername());
        return ResponseEntity.ok(details);
    }

    @Operation(
            summary = "Send results of exam to candidates.",
            description = "Sends results of an exam to candidates who have appeared."
    )
    @PostMapping("/send-results/{examId}")
    public ResponseEntity<ResultMailResponseDTO> SendResults(
           @PathVariable String examId,
            @AuthenticationPrincipal UserDetails userDetails){
        ResultMailResponseDTO resultMailResponseDTO =
                submissionService.sendResults(examId,userDetails.getUsername());
        return ResponseEntity.ok(resultMailResponseDTO);
    }
}