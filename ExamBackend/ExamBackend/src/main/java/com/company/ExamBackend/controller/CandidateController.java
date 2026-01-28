package com.company.ExamBackend.controller;

import com.company.ExamBackend.dto.AnswerRequestDTO;
import com.company.ExamBackend.dto.CandidateDashboardDTO;
import com.company.ExamBackend.dto.CandidateExamDTO;
import com.company.ExamBackend.dto.StartExamRequestDTO;
import com.company.ExamBackend.service.AnswerService;
import com.company.ExamBackend.service.ExamCandidateService;
import com.company.ExamBackend.service.ExamService;
import com.company.ExamBackend.service.SubmissionService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidateUser")
@AllArgsConstructor
public class CandidateController {

    private final ExamService examService;
    private final ExamCandidateService examCandidateService;
    private final SubmissionService submissionService;
    private final AnswerService answerService;

    @GetMapping("/dashboard/{email}")
    public ResponseEntity<List<CandidateDashboardDTO>> getDashboard(@PathVariable String email) {
        return ResponseEntity.ok(examCandidateService.getCandidateDashboard(email));
    }

    @GetMapping("/exam/{examId}")
    public ResponseEntity<CandidateExamDTO> getExamContent(@PathVariable String examId) {
        return ResponseEntity.ok(examService.getExamForCandidate(examId));
    }

    @GetMapping("/eligibility/{examId}/{email}")
    public ResponseEntity<?> checkEligibility(@PathVariable String examId, @PathVariable String email) {
        try {
            submissionService.checkEligibility(examId, email);
            return ResponseEntity.ok("Eligible to start.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }

    @PostMapping("/start")
    public ResponseEntity<?> startExam(@RequestBody StartExamRequestDTO dto) {
        try {
            return ResponseEntity.ok(submissionService.startExam(dto));
        } catch (RuntimeException e) {
            if ("ALREADY_STARTED_OR_COMPLETED".equals(e.getMessage())) {
                return ResponseEntity.status(409).body("You already have an active exam session.");
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/answer")
    public ResponseEntity<Void> saveAnswer(@RequestBody AnswerRequestDTO dto) {
        answerService.saveOrUpdateAnswer(dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/submit/{submissionId}")
    public ResponseEntity<Void> finalize(@PathVariable String submissionId) {
        answerService.finalizeSubmission(submissionId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/violation/{submissionId}")
    public ResponseEntity<Void> addViolation(@PathVariable String submissionId) {
        submissionService.reportViolation(submissionId);
        return ResponseEntity.ok().build();
    }
}