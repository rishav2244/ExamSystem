package com.company.ExamBackend.controller;

import com.company.ExamBackend.dto.SubmissionDetailsDTO;
import com.company.ExamBackend.dto.SubmissionResponseDTO;
import com.company.ExamBackend.service.SubmissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
            description = "Returns details of candidate's exam"
    )
    public ResponseEntity<List<SubmissionResponseDTO>> getExamSubmissions(@PathVariable String examId) {
        List<SubmissionResponseDTO> submissions = submissionService.getSubmissionsByExam(examId);
        return ResponseEntity.ok(submissions);
    }

    @Operation(
            summary = "Gets submissions for an exam",
            description = "Returns details of candidate's exam"
    )
    @GetMapping("/{submissionId}")
    public ResponseEntity<SubmissionDetailsDTO> getSubmissionDetails(@PathVariable String submissionId) {
        var details = submissionService.getSubmissionDetails(submissionId);
        return ResponseEntity.ok(details);
    }
}