package com.company.ExamBackend.mapper;

import com.company.ExamBackend.dto.QuestionResponseDTO;
import com.company.ExamBackend.model.Question;

public class QuestionMapper {

    public static QuestionResponseDTO toDTO(Question entity) {
        QuestionResponseDTO dto = new QuestionResponseDTO();
        dto.setId(entity.getId());
        dto.setText(entity.getText());
        dto.setOptions(entity.getOptions());
        dto.setCorrectOption(entity.getCorrectOption());
        dto.setMarks(entity.getMarks());

        return dto;
    }

    public static Question toEntity(QuestionResponseDTO dto) {
        Question entity = new Question();
        entity.setId(dto.getId());
        entity.setText(dto.getText());
        entity.setOptions(dto.getOptions());
        entity.setCorrectOption(dto.getCorrectOption());
        entity.setMarks(dto.getMarks());

        return entity;
    }
}