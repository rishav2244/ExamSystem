package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.StartExamRequestDTO;

public interface SubmissionService {
    String startExam(StartExamRequestDTO dto);
    void reportViolation(String submissionId);
    void checkEligibility(String examId, String email);
}