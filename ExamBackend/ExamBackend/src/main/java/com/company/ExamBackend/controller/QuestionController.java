package com.company.ExamBackend.controller;

import com.company.ExamBackend.dto.QuestionDTO;
import com.company.ExamBackend.dto.QuestionResponseDTO;
import com.company.ExamBackend.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/exams")
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping("/{examId}/questions")
    public ResponseEntity<Void> uploadQuestions(@PathVariable String examId, @RequestBody List<QuestionDTO> questions) {

        questionService.saveQuestions(examId, questions);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{examId}/questions")
    public ResponseEntity<List<QuestionResponseDTO>> getExamQuestions(
            @PathVariable String examId) {

        List<QuestionResponseDTO> questions = questionService.getQuestionsForExam(examId);
        return ResponseEntity.ok(questions);
    }
}
