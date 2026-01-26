package com.company.ExamBackend.controller;

import com.company.ExamBackend.dto.CandidateDeleteDTO;
import com.company.ExamBackend.dto.CandidateResponseDTO;
import com.company.ExamBackend.service.ExamCandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidate")
@RequiredArgsConstructor
public class ExamCandidateController {

    private final ExamCandidateService examCandidateService;

    @GetMapping("/candidates/{examId}")
    public ResponseEntity<List<CandidateResponseDTO>> getCandidates(@PathVariable String examId) {
        List<CandidateResponseDTO> candidates = examCandidateService.getCandidates(examId);
        if (candidates.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(candidates);
    }

    @DeleteMapping("/remove")
    public ResponseEntity<String> deleteCandidate(@RequestBody CandidateDeleteDTO deleteRequest) {
        examCandidateService.removeCandidate(
                deleteRequest.getExamId(),
                deleteRequest.getEmail()
        );
        return ResponseEntity.ok("Candidate removed successfully.");
    }
}
