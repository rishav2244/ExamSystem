package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.CandidateResponseDTO;
import com.company.ExamBackend.dto.CreateExamDTO;
import com.company.ExamBackend.dto.ExamResponseDTO;
import com.company.ExamBackend.dto.CandidateExamDTO;
import com.company.ExamBackend.model.ExamCandidate;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ExamService {
    ExamResponseDTO createExam(CreateExamDTO createExamDTO, String adminEmail);
    Page<ExamResponseDTO> getExams(String adminEmail, int page, int size);
    Page<ExamResponseDTO> getExamsByStatus(String status, String adminEmail, int page, int size);
    void deleteExam(String id, String adminEmail);
    void updateExam(String examId, String status);
    void resendInvitation(String candidateId);
    List<CandidateResponseDTO> assignGroupToExam(String examId, String groupId);
    CandidateExamDTO getExamForCandidate(String examId);
}
