package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.dto.CandidateResponseDTO;
import com.company.ExamBackend.dto.CandidateDashboardDTO;
import com.company.ExamBackend.mapper.CandidateMapper;
import com.company.ExamBackend.model.ExamCandidate;
import com.company.ExamBackend.repository.ExamCandidateRepo;
import com.company.ExamBackend.service.ExamCandidateService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@AllArgsConstructor
public class ExamCandidateServiceImpl implements ExamCandidateService {

    private final ExamCandidateRepo examCandidateRepo;

    //Lists all candidates for respective exam.
    @Override
    public List<CandidateResponseDTO> getCandidates(String examId) {
        List<ExamCandidate> candidates = examCandidateRepo.findByExamId(examId);
        return CandidateMapper.toDTOList(candidates);
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
                .filter(examCandidate -> "INVITED".equals(examCandidate.getStatus()))
                .filter(candidate -> {
                    Instant start = candidate.getExam().getStartTime();
                    Instant end = candidate.getExam().getEndTime();
                    // Logic remains the same, just using Instant methods
                    return (now.equals(start) || now.isAfter(start)) && now.isBefore(end);
                })
                .map(candidate -> CandidateDashboardDTO.builder()
                        .examId(candidate.getExam().getId())
                        .title(candidate.getExam().getTitle())
                        .duration(candidate.getExam().getDuration())
                        .startTime(candidate.getExam().getStartTime())
                        .endTime(candidate.getExam().getEndTime())
                        .candidateStatus(candidate.getStatus())
                        .build())
                .toList();
    }
}
