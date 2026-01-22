package com.company.ExamBackend.mapper;

import com.company.ExamBackend.dto.CandidateResponseDTO;
import com.company.ExamBackend.model.ExamCandidate;

import java.util.List;
import java.util.stream.Collectors;

public class CandidateMapper {
    public static CandidateResponseDTO toDTO(ExamCandidate entity) {
        return CandidateResponseDTO.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .name(entity.getName())
                .status(entity.getStatus())
                .examId(entity.getExam().getId())
                .examTitle(entity.getExam().getTitle())
                .build();
    }

    public static List<CandidateResponseDTO> toDTOList(List<ExamCandidate> entities) {
        return entities.stream()
                .map(CandidateMapper::toDTO)
                .toList();
    }
}
