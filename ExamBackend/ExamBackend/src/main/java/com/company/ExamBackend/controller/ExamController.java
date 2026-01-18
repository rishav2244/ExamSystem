package com.company.ExamBackend.controller;

import com.company.ExamBackend.dto.CreateExamDTO;
import com.company.ExamBackend.dto.ExamResponseDTO;
import com.company.ExamBackend.service.ExamService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
@AllArgsConstructor
public class ExamController {

    private final ExamService examService;

    @PostMapping("/createExam")
    public ResponseEntity<ExamResponseDTO> createExam(@RequestBody CreateExamDTO createExamDTO) {

        ExamResponseDTO response = examService.createExam(createExamDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getExams")
    public ResponseEntity<List<ExamResponseDTO>> getExams(@RequestParam(required = false) String status) {

        if (status != null && !status.isEmpty()) {
            return ResponseEntity.ok(examService.getExamsByStatus(status));
        }

        return ResponseEntity.ok(examService.getExams());
    }

    @PostMapping("/publishExam/{examId}")
    public ResponseEntity<String> publishExam(@PathVariable String examId){
        examService.updateExam(examId, "PUBLISHED");
        return ResponseEntity.ok("Exam published");
    }

    @DeleteMapping("/delete/{examId}")
    public ResponseEntity<Void> deleteExam(@PathVariable String examId) {
        examService.deleteExam(examId);
        return ResponseEntity.noContent().build();
    }
}