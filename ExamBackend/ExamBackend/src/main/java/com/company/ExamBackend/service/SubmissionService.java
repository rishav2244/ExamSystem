package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.StartExamRequestDTO;
import com.company.ExamBackend.dto.StartExamResponseDTO;

public interface SubmissionService {
    StartExamResponseDTO startExam(StartExamRequestDTO dto);
    void reportViolation(String submissionId);
    void checkEligibility(String examId, String email);
}