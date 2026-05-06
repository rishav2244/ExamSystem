package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.*;
import org.springframework.data.domain.Page;

import java.io.PrintWriter;
import java.util.List;

public interface SubmissionService {
    StartExamResponseDTO startExam(StartExamRequestDTO dto, String email);
    void reportViolation(String submissionId);
    EligibilityResponseDTO checkEligibility(String examId, String email);

    Page<SubmissionResponseDTO> getSubmissionsByExam(
            String examId,
            String adminEmail,
            int page,
            int size
    );

    Page<SubmissionResponseDTO> searchSubmissionByExam(
            SearchSubmCandDTO searchSubmCandDTO,
            String adminEmail,
            int page,
            int size
    );

    SubmissionDetailsDTO getSubmissionDetails(String submissionId, String adminEmail);
    SubmissionsOverviewDTO getSubmissionsOverview(String email);
    ResultMailResponseDTO sendResults(String examId, String adminEmail);
    Page<CandidateSubmissionDetailDTO> fetchCandidateResults(String candidateEmail, int page, int size);
    Page<CandidateSubmissionDetailDTO> searchCandidateResults(
            CandidateResSearchDTO candidateResSearchDTO,
            String candidateEmail,
            int page,
            int size
    );

    void exportSubmissionsToCsv(String examId, String adminEmail, PrintWriter writer);
}