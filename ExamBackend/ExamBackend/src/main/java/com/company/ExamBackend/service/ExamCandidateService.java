package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.CandidateDashboardDTO;
import com.company.ExamBackend.dto.CandidateResponseDTO;

import java.util.List;

public interface ExamCandidateService {
    List<CandidateResponseDTO> getCandidates(String examId);
    void removeCandidate(String examId, String email);
    public List<CandidateDashboardDTO> getCandidateDashboard(String email);
}
