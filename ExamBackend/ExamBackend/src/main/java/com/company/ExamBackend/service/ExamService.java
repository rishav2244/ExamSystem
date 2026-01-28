package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.CreateExamDTO;
import com.company.ExamBackend.dto.ExamResponseDTO;
import com.company.ExamBackend.dto.CandidateExamDTO;
import com.company.ExamBackend.model.ExamCandidate;

import java.util.List;

public interface ExamService {
    ExamResponseDTO createExam(CreateExamDTO createExamDTO);
    List<ExamResponseDTO> getExams();
    List<ExamResponseDTO> getExamsByStatus(String status);
    void deleteExam(String id);
    void updateExam(String examId, String status);
    List<ExamCandidate> assignGroupToExam(String examId, String groupId);
    public CandidateExamDTO getExamForCandidate(String examId);
}
