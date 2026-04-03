package com.company.ExamBackend.controller;

import com.company.ExamBackend.dto.*;
import com.company.ExamBackend.service.SubmissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
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
    public ResponseEntity<Page<SubmissionResponseDTO>> getExamSubmissions(
            @PathVariable String examId,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<SubmissionResponseDTO> submissions =
                submissionService.getSubmissionsByExam(
                        examId,
                        userDetails.getUsername(),
                        page,
                        size);
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

    @Operation(
            summary = "Search for submission",
            description = "Searches for candidate submission by name or email"
    )
    @PostMapping("/submission/search")
    public ResponseEntity<Page<SubmissionResponseDTO>> searchCandidateSubmission(
            @RequestBody SearchSubmCandDTO searchSubmCandDTO,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(submissionService.searchSubmissionByExam(
                searchSubmCandDTO,
                userDetails.getUsername(),
                page,
                size)
        );
    }

//    @Operation(
//            summary = "Submissions CSV download",
//            description = "Sends CSV containing details of candidatate submissions"
//    )
//    public void downloadSubmissionsCsv(HttpServletResponse response) throws IOException {
//        // 1. Fetch your data
//        List<SubmissionDTO> submissions = submissionService.findAllByExamId(...);
//
//        // 2. Set headers
//        response.setContentType("text/csv");
//        response.setHeader("Content-Disposition", "attachment; filename=\"submissions.csv\"");
//
//        // 3. Write to response stream
//        submissionService.writeSubmissionsToCsv(response.getWriter(), submissions);
//    }
}