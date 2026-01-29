package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.dto.CandidateResponseDTO;
import com.company.ExamBackend.dto.CandidateDashboardDTO;
import com.company.ExamBackend.mapper.CandidateMapper;
import com.company.ExamBackend.model.ExamCandidate;
import com.company.ExamBackend.repository.ExamCandidateRepo;
import com.company.ExamBackend.service.ExamCandidateService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class ExamCandidateServiceImpl implements ExamCandidateService {

    private final ExamCandidateRepo examCandidateRepo;

    @Override
    public List<CandidateResponseDTO> getCandidates(String examId) {
        List<ExamCandidate> candidates = examCandidateRepo.findByExamId(examId);
        return CandidateMapper.toDTOList(candidates);
    }

    @Override
    public void removeCandidate(String examId, String email) {
        examCandidateRepo.deleteByExamIdAndEmail(examId, email);
    }

    @Override
    public List<CandidateDashboardDTO> getCandidateDashboard(String email) {
        return examCandidateRepo.findByEmail(email).stream()
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
