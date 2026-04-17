package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.dto.CandidateResponseDTO;
import com.company.ExamBackend.dto.CandidateDashboardDTO;
import com.company.ExamBackend.exception.ExamCandidateNotFoundException;
import com.company.ExamBackend.exception.InvalidActionException;
import com.company.ExamBackend.mapper.CandidateMapper;
import com.company.ExamBackend.model.ExamCandidate;
import com.company.ExamBackend.repository.ExamCandidateRepo;
import com.company.ExamBackend.service.ExamCandidateService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public Page<CandidateResponseDTO> getCandidates(
            String examId,
            String adminEmail,
            int page,
            int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "id");
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ExamCandidate> candidates = examCandidateRepo.findByExamIdAndAdminEmail(examId,adminEmail,pageable);
        return candidateMapper.toDTOList(candidates);
    }

    //Removes candidate from exam
    @Transactional
    @Override
    public void removeCandidate(String examId, String email) {
        ExamCandidate reqCandidate = examCandidateRepo.findByExamIdAndEmail(examId, email);
        if(reqCandidate == null)
        {
            throw new ExamCandidateNotFoundException("ExamCandidate of email "+email+" not found");
        }

        if(!checkDeletionValidity(reqCandidate)) {
            throw new InvalidActionException("Candidate of status "+reqCandidate.getStatus()+" cannot be deleted.");
        }

        examCandidateRepo.deleteByExamIdAndEmail(examId, email);
    }

    //Sends exam details to candidate dashboard.
    @Override
    public List<CandidateDashboardDTO> getCandidateDashboard(String email) {
        return examCandidateRepo.findActiveDashboardExams(email, Instant.now())
                .stream()
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

    private boolean checkDeletionValidity(ExamCandidate candidate) {
        return (
                candidate.getStatus().equals("INVITED")
                || candidate.getStatus().equals("UNINVITED")
        );
    }

    private ExamCandidate getExamCandidate(String examId, String email) {
        return examCandidateRepo.findByExamIdAndEmail(examId, email);
    }
}
