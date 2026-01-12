package com.company.ExamBackend.mapper;

import com.company.ExamBackend.dto.ExamResponseDTO;
import com.company.ExamBackend.model.Exam;

public class ExamMapper {

    public static ExamResponseDTO toDTO(Exam entity) {
        ExamResponseDTO dto = new ExamResponseDTO();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setDuration(entity.getDuration());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setStatus(entity.getStatus());
        dto.setCreatedBy(entity.getCreatedBy().getId());
        return dto;
    }

    public static Exam toEntity(ExamResponseDTO dto) {
        Exam entity = new Exam();
        entity.setId(dto.getId());
        entity.setTitle(dto.getTitle());
        entity.setDuration(dto.getDuration());
        entity.setStartTime(dto.getStartTime());
        entity.setEndTime(dto.getEndTime());
        entity.setStatus(dto.getStatus());
        return entity;
    }
}
