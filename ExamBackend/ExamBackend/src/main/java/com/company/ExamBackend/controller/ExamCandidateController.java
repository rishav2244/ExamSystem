package com.company.ExamBackend.controller;

import com.company.ExamBackend.dto.CandidateDeleteDTO;
import com.company.ExamBackend.dto.CandidateResponseDTO;
import com.company.ExamBackend.service.ExamCandidateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidate")
@RequiredArgsConstructor
@Tag(
        name = "Exam candidates management",
        description = "Endpoints for listing all exam candidates and removing any."
)
public class ExamCandidateController {

    private final ExamCandidateService examCandidateService;

    //Sends list of candidates assigned to exam.
    @GetMapping("/candidates/{examId}")
    @Operation(
            summary = "Lists all candidates in an exam",
            description = "Used by admin to list all candidates in an exam, along with relevant details."
    )
    public ResponseEntity<List<CandidateResponseDTO>> getCandidates(@PathVariable String examId) {
        List<CandidateResponseDTO> candidates = examCandidateService.getCandidates(examId);
        if (candidates.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(candidates);
    }

    @DeleteMapping("/remove")
    @Operation(
            summary = "Remove candidate from an exam.",
            description = "Used by admin to remove a candidate from an exam."
    )
    public ResponseEntity<String> deleteCandidate(@RequestBody CandidateDeleteDTO deleteRequest) {
        examCandidateService.removeCandidate(
                deleteRequest.getExamId(),
                deleteRequest.getEmail()
        );
        return ResponseEntity.ok("Candidate removed successfully.");
    }
}
