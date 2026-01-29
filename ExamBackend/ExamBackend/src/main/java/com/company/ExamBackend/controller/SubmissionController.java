package com.company.ExamBackend.controller;

import com.company.ExamBackend.dto.SubmissionResponseDTO;
import com.company.ExamBackend.service.SubmissionService;
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
public class SubmissionController {

    private final SubmissionService submissionService;

    @GetMapping("/exam/{examId}")
    public ResponseEntity<List<SubmissionResponseDTO>> getExamSubmissions(@PathVariable String examId) {
        List<SubmissionResponseDTO> submissions = submissionService.getSubmissionsByExam(examId);
        return ResponseEntity.ok(submissions);
    }
}