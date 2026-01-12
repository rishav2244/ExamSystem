package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.CreateExamDTO;
import com.company.ExamBackend.dto.ExamResponseDTO;

import java.util.List;

public interface ExamService {
    ExamResponseDTO createExam(CreateExamDTO createExamDTO);
    List<ExamResponseDTO> getExams();
    List<ExamResponseDTO> getExamsByStatus(String status);
    void deleteExam(String id);
}
