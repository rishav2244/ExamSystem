package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.StartExamRequestDTO;
import com.company.ExamBackend.dto.StartExamResponseDTO;
import com.company.ExamBackend.dto.SubmissionResponseDTO;

import java.util.List;

public interface SubmissionService {
    StartExamResponseDTO startExam(StartExamRequestDTO dto);
    void reportViolation(String submissionId);
    void checkEligibility(String examId, String email);
    List<SubmissionResponseDTO> getSubmissionsByExam(String examId);
}