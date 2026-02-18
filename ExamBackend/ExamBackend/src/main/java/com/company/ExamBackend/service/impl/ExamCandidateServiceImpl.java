package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.dto.CandidateResponseDTO;
import com.company.ExamBackend.dto.CandidateDashboardDTO;
import com.company.ExamBackend.mapper.CandidateMapper;
import com.company.ExamBackend.model.ExamCandidate;
import com.company.ExamBackend.repository.ExamCandidateRepo;
import com.company.ExamBackend.service.ExamCandidateService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
@AllArgsConstructor
public class ExamCandidateServiceImpl implements ExamCandidateService {

    private final ExamCandidateRepo examCandidateRepo;

    private final CandidateMapper candidateMapper;

    //Lists all candidates for respective exam.
    @Override
    public List<CandidateResponseDTO> getCandidates(String examId) {
        List<ExamCandidate> candidates = examCandidateRepo.findByExamId(examId);
        return candidateMapper.toDTOList(candidates);
    }

    //Removes candidate from exam, to be implemented later.
    @Override
    public void removeCandidate(String examId, String email) {
        examCandidateRepo.deleteByExamIdAndEmail(examId, email);
    }

    //Sends exam details to candidate dashboard.
    @Override
    public List<CandidateDashboardDTO> getCandidateDashboard(String email) {
        Instant now = Instant.now();

        return examCandidateRepo.findByEmail(email).stream()
                .filter(candidate -> "INVITED".equals(candidate.getStatus()))
                .filter(candidate -> isWithinValidTimeWindow(candidate, now))
                .map(candidateMapper::toDashboardDTO)
                .toList();
    }

    // ======================================================================================
    // Helper methods
    // ======================================================================================

    private boolean isWithinValidTimeWindow(ExamCandidate candidate, Instant now) {
        Instant start = candidate.getExam().getStartTime();
        Instant end = candidate.getExam().getEndTime();
        int durationMins = candidate.getExam().getDuration();

        boolean isActive = (now.equals(start) || now.isAfter(start)) && now.isBefore(end);
        if (!isActive) return false;

        Instant latestPossibleFinish = now.plus(Duration.ofMinutes(durationMins));
        return !latestPossibleFinish.isAfter(end);
    }
}
