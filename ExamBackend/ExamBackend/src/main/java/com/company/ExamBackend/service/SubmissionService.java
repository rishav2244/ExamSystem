package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.*;

import java.util.List;

public interface SubmissionService {
    StartExamResponseDTO startExam(StartExamRequestDTO dto);
    void reportViolation(String submissionId);
    void checkEligibility(String examId, String email);
    List<SubmissionResponseDTO> getSubmissionsByExam(String examId, String adminEmail);
    SubmissionDetailsDTO getSubmissionDetails(String submissionId, String adminEmail);
    SubmissionsOverviewDTO getSubmissionsOverview(String email);
    ResultMailResponseDTO sendResults(String examId, String adminEmail);
}