package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.CandidateResponseDTO;

import java.util.List;

public interface ExamCandidateService {
    List<CandidateResponseDTO> getCandidates(String examId);
}
