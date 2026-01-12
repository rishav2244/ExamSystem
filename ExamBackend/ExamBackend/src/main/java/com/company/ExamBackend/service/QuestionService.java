package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.QuestionDTO;
import com.company.ExamBackend.dto.QuestionResponseDTO;

import java.util.List;

public interface QuestionService {

    void saveQuestionsForExam(String examId, List<QuestionDTO> questions);

    List<QuestionResponseDTO> getQuestionsByExam(String examId);
}