package com.company.ExamBackend.mapper;

import com.company.ExamBackend.dto.CandidateDashboardDTO;
import com.company.ExamBackend.dto.CandidateResponseDTO;
import com.company.ExamBackend.model.ExamCandidate;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CandidateMapper {
    public CandidateResponseDTO toDTO(ExamCandidate entity) {
        return CandidateResponseDTO.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .name(entity.getName())
                .status(entity.getStatus())
                .examId(entity.getExam().getId())
                .examTitle(entity.getExam().getTitle())
                .build();
    }

    public List<CandidateResponseDTO> toDTOList(List<ExamCandidate> entities) {
        return entities.stream()
                .map(this::toDTO)//This calls current spring object.
                .toList();
    }

    public Page<CandidateResponseDTO> toDTOList(Page<ExamCandidate> entities) {
        return entities.map(this::toDTO);
    }

    public CandidateDashboardDTO toDashboardDTO(ExamCandidate entity) {
        return CandidateDashboardDTO.builder()
                .examId(entity.getExam().getId())
                .title(entity.getExam().getTitle())
                .duration(entity.getExam().getDuration())
                .startTime(entity.getExam().getStartTime())
                .endTime(entity.getExam().getEndTime())
                .candidateStatus(entity.getStatus())
                .build();
    }
}
