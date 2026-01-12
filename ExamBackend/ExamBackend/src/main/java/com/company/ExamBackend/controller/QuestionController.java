package com.company.ExamBackend.controller;

import com.company.ExamBackend.dto.QuestionDTO;
import com.company.ExamBackend.dto.QuestionResponseDTO;
import com.company.ExamBackend.service.QuestionService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams/{examId}/questions")
@AllArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping("/upload")
    public ResponseEntity<Void> uploadQuestions(
            @PathVariable String examId,
            @RequestBody List<QuestionDTO> questions) {

        questionService.saveQuestionsForExam(examId, questions);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/getQuestions")
    public ResponseEntity<List<QuestionResponseDTO>> getQuestions(
            @PathVariable String examId) {

        List<QuestionResponseDTO> dtos = questionService.getQuestionsByExam(examId);
        return ResponseEntity.ok(dtos);
    }
}