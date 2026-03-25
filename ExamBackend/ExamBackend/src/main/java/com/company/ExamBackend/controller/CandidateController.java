package com.company.ExamBackend.controller;

import com.company.ExamBackend.dto.*;
import com.company.ExamBackend.service.AnswerService;
import com.company.ExamBackend.service.ExamCandidateService;
import com.company.ExamBackend.service.ExamService;
import com.company.ExamBackend.service.SubmissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidateUser")
@AllArgsConstructor
@Tag(
        name = "Candidate side APIs",
        description = "Endpoints for candidate side utilities."
)
public class CandidateController {

    private final ExamService examService;
    private final ExamCandidateService examCandidateService;
    private final SubmissionService submissionService;
    private final AnswerService answerService;

    @GetMapping("/dashboard/{email}")
    @Operation(
            summary = "Dashboard details of a candidate.",
            description = "Gets dashboard details of a candidate, mostly available exams in this case."
    )
    public ResponseEntity<List<CandidateDashboardDTO>> getDashboard(@PathVariable String email) {
        return ResponseEntity.ok(examCandidateService.getCandidateDashboard(email));
    }

    @Operation(
            summary = "Gets content of an exam.",
            description = "Gets all questions, options, etc of an exam that the user has chosen to appear for." +
                    "Naturally, it does not send info about which option is correct. Do not search for that, " +
                    "backend will not give you that access."
    )
    @GetMapping("/exam/{examId}")
    public ResponseEntity<CandidateExamDTO> getExamContent(@PathVariable String examId) {
        return ResponseEntity.ok(examService.getExamForCandidate(examId));
    }

    @Operation(
            summary = "Checks eligibility for an exam.",
            description = "Checks if candidate is eligible for the exam. Mainly used to ensure candidates don't" +
                    "do a lot of usual sneaky stuff."
    )
    @GetMapping("/eligibility/{examId}/{email}")
    public ResponseEntity<?> checkEligibility(@PathVariable String examId, @PathVariable String email) {
        try {
            submissionService.checkEligibility(examId, email);
            return ResponseEntity.ok("Eligible to start.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }

    @Operation(
            summary = "\"Starts\" an exam.",
            description = "Starts exam, HOWEVER, IT DOES NOT RETURN ANY RELEVANT DATA. Performs an eligibility " +
                    "check, mainly because candidate might find it funny to linger on the check screen for an hour. " +
                    " Other database operations are performed, but those are not relevant to your work."
    )
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

    @Operation(
            summary = "\"Saves\" an answer.",
            description = "Saves an answer. Creates a new entry in our DB against the associated submission if one " +
                    "does not exist, else updates existing entry for relevant question."
    )
    @PostMapping("/answer")
    public ResponseEntity<Void> saveAnswer(@RequestBody AnswerRequestDTO dto) {
        answerService.saveOrUpdateAnswer(dto);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Ends the exam.",
            description = "Ends the exam by finalizing our submission. Evaluation is done immediately after that."
    )
    @PostMapping("/submit/{submissionId}")
    public ResponseEntity<Void> finalize(@PathVariable String submissionId) {
        answerService.finalizeSubmission(submissionId);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Increments violation counter.",
            description = "Increments violation counter. If you're searching for \"reporting\" as in snapshots, " +
                    "please refer to POST api/snapshots/ which accepts multiform part data."
    )
    @PatchMapping("/violation/{submissionId}")
    public ResponseEntity<Void> addViolation(@PathVariable String submissionId) {
        submissionService.reportViolation(submissionId);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Fetches candidate results",
            description = "Fetches results for exams for which candidate has appeared and results have been mailed."
    )
    @GetMapping("/results")
    public ResponseEntity<CandidateSubmissionsOverviewDTO> getResults(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        CandidateSubmissionsOverviewDTO candidateSubmissionsOverview = submissionService.fetchCandidateResults(userDetails.getUsername());
        return ResponseEntity.ok(candidateSubmissionsOverview);
    }
}