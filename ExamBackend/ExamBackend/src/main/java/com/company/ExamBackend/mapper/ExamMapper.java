package com.company.ExamBackend.mapper;

import com.company.ExamBackend.dto.CreateExamDTO;
import com.company.ExamBackend.dto.ExamResponseDTO;
import com.company.ExamBackend.model.Exam;
import org.springframework.stereotype.Component;

@Component
public class ExamMapper {

    public ExamResponseDTO toDTO(Exam entity) {
        ExamResponseDTO dto = new ExamResponseDTO();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setDuration(entity.getDuration());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setStatus(entity.getStatus());
        dto.setCreatedBy(entity.getCreatedBy().getEmail());
        dto.setCutoff(entity.getCutoff());
        return dto;
    }

    public Exam toEntity(CreateExamDTO dto) {
        Exam entity = new Exam();
        entity.setTitle(dto.getTitle());
        entity.setDuration(dto.getDuration());
        entity.setStartTime(dto.getStartTime());
        entity.setEndTime(dto.getEndTime());
        entity.setCutoff(dto.getCutoff());
        entity.setTotalScore(0);
        entity.setStatus(dto.getStatus());
        return entity;
    }
}
