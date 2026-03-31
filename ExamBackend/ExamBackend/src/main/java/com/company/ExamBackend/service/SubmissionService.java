package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.*;
import org.springframework.data.domain.Page;

import java.util.List;

public interface SubmissionService {
    StartExamResponseDTO startExam(StartExamRequestDTO dto, String email);
    void reportViolation(String submissionId);
    void checkEligibility(String examId, String email);
    List<SubmissionResponseDTO> getSubmissionsByExam(String examId, String adminEmail);
    SubmissionDetailsDTO getSubmissionDetails(String submissionId, String adminEmail);
    SubmissionsOverviewDTO getSubmissionsOverview(String email);
    ResultMailResponseDTO sendResults(String examId, String adminEmail);
    Page<CandidateSubmissionDetailDTO> fetchCandidateResults(String candidateEmail, int page, int size);
}