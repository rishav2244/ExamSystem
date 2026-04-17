package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.CandidateDashboardDTO;
import com.company.ExamBackend.dto.CandidateResponseDTO;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ExamCandidateService {
    Page<CandidateResponseDTO> getCandidates(String examId, String adminEmail, int page, int size);
    void removeCandidate(String examId, String email);
    List<CandidateDashboardDTO> getCandidateDashboard(String email);
}
