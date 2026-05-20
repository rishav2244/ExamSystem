package com.company.ExamBackend.controller;

import com.company.ExamBackend.dto.*;
import com.company.ExamBackend.exception.EligibilityException;
import com.company.ExamBackend.service.AnswerService;
import com.company.ExamBackend.service.ExamCandidateService;
import com.company.ExamBackend.service.ExamService;
import com.company.ExamBackend.service.SubmissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.ErrorResponse;
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
    public ResponseEntity<List<CandidateDashboardDTO>> getDashboard(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable(required = false) String email) {
        return ResponseEntity.ok(examCandidateService.getCandidateDashboard(userDetails.getUsername()));
    }

    @Operation(
            summary = "Gets content of an exam CASE: Fresh exam.",
            description = "Gets all questions, options, etc of an exam that the user has chosen to appear for." +
                    "Naturally, it does not send info about which option is correct. Do not search for that, " +
                    "backend will not give you that access."
    )
    @GetMapping("/exam/{examId}")
    public ResponseEntity<CandidateExamDTO> getExamContent(
            @PathVariable String examId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(examService.getExamForCandidate(userDetails.getUsername(), examId));
    }
//
//    @Operation(
//            summary = "Gets content of an exam CASE: Resuming exam.",
//            description = "Checks if exam can be resumed and sends back exam data alongside existing candidate answers."
//    )
//    @PostMapping("/resume")
//    public ResponseEntity<CandidateExamDTO> resume(
//            @RequestBody ExamResumeRequestDTO examResumeRequestDTO,
//            @AuthenticationPrincipal UserDetails userDetails
//    ) {
//        return ResponseEntity.ok(examService.getExamForCandidate(
//                userDetails.getUsername(),
//                examResumeRequestDTO.getExamId(),
//                "Resume"
//        ));
//    }

    @Operation(
            summary = "Checks eligibility for an exam.",
            description = "Checks if candidate is eligible for the exam. Mainly used to ensure candidates don't" +
                    "do a lot of usual sneaky stuff."
    )
    @GetMapping("/eligibility/{examId}")
    public ResponseEntity<?> checkEligibility(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String examId) {
        try {
            EligibilityResponseDTO response = submissionService.checkEligibility(examId, userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (EligibilityException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Not eligible.");
        }
    }

    @Operation(
            summary = "\"Starts\" an exam.",
            description = "Starts exam, HOWEVER, IT DOES NOT RETURN ANY RELEVANT DATA. Performs an eligibility " +
                    "check, mainly because candidate might find it funny to linger on the check screen for an hour. " +
                    " Other database operations are performed, but those are not relevant to your work."
    )
    @PostMapping("/start")
    public ResponseEntity<?> startExam(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody StartExamRequestDTO dto) {
        try {
            return ResponseEntity.ok(submissionService.startExam(dto,userDetails.getUsername()));
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
    public ResponseEntity<Void> finalize(
            @PathVariable String submissionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        answerService.finalizeSubmission(submissionId, userDetails.getUsername());
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
    public ResponseEntity<Page<CandidateSubmissionDetailDTO>> getResults(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<CandidateSubmissionDetailDTO> candidateSubmissionsOverview =
                submissionService.fetchCandidateResults(userDetails.getUsername(), page, size);
        return ResponseEntity.ok(candidateSubmissionsOverview);
    }

    @Operation(
            summary = "Searches for a candidate result",
            description = "Fetches results for exams for which candidate has appeared and " +
                    "results have been mailed, based on criteria"
    )
    @PostMapping("/results/search")
    public ResponseEntity<Page<CandidateSubmissionDetailDTO>> searchResults(
            @RequestBody CandidateResSearchDTO candidateResSearchDTO,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<CandidateSubmissionDetailDTO> candidateSubmissionsOverview =
                submissionService.searchCandidateResults(candidateResSearchDTO, userDetails.getUsername(), page, size);
        return ResponseEntity.ok(candidateSubmissionsOverview);
    }
}