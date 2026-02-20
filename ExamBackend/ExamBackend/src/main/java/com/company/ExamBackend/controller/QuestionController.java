package com.company.ExamBackend.controller;

import com.company.ExamBackend.dto.QuestionDTO;
import com.company.ExamBackend.dto.QuestionResponseDTO;
import com.company.ExamBackend.service.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/exams")
@Tag(
        name = "Question Management(Admin side)",
        description = "Endpoints for Question management on admin side."
)
public class QuestionController {

    private final QuestionService questionService;

    @Operation(
            summary = "Adds questions against and exam and answers against those questions.",
            description = "Used by admin to create new exam."
    )
    @PostMapping("/{examId}/questions")
    public ResponseEntity<Void> uploadQuestions(@PathVariable String examId, @RequestBody List<QuestionDTO> questions) {

        questionService.saveQuestions(examId, questions);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Gets questions and answers of an exam.",
            description = "Used by admin to get details of exam."
    )
    @GetMapping("/{examId}/questions")
    public ResponseEntity<List<QuestionResponseDTO>> getExamQuestions(
            @PathVariable String examId) {

        List<QuestionResponseDTO> questions = questionService.getQuestionsForExam(examId);
        return ResponseEntity.ok(questions);
    }
}
