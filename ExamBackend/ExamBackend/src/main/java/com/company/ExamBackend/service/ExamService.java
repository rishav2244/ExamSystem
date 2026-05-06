package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.*;
import com.company.ExamBackend.model.ExamCandidate;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ExamService {
    ExamResponseDTO createExam(CreateExamDTO createExamDTO, String adminEmail);
    Page<ExamResponseDTO> getExams(String adminEmail, int page, int size);
    Page<ExamResponseDTO> getExamsByStatus(String status, String adminEmail, int page, int size);
    Page<ExamResponseDTO> searchExam(ExamSearchDTO examSearchDTO, String adminEmail, int page, int size);
    void deleteExam(String id, String adminEmail);
    void updateExam(String examId, String status, String adminEmail);
    void resendInvitation(String candidateId);
    String assignGroupToExam(String examId, String groupId, String adminEmail);
    CandidateExamDTO getExamForCandidate(String candidateEmail, String examId, String requestType);
}
