package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.QuestionDTO;
import com.company.ExamBackend.dto.QuestionResponseDTO;

import java.util.List;

public interface QuestionService {
    void saveQuestions(String examId, List<QuestionDTO> questionDTOs);
    List<QuestionResponseDTO> getQuestionsForExam(String examId);
}
