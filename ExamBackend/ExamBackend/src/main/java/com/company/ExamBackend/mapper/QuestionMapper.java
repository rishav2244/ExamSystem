package com.company.ExamBackend.mapper;

import com.company.ExamBackend.dto.OptionDTO;
import com.company.ExamBackend.dto.QuestionDTO;
import com.company.ExamBackend.model.Options;
import com.company.ExamBackend.model.Question;

import java.util.List;
import java.util.stream.Collectors;

public class QuestionMapper {

    public static Question toEntity(QuestionDTO dto) {
        Question question = new Question();
        question.setText(dto.getText());
        question.setMarks(dto.getMarks());

        List<Options> options = dto.getOptions()
                .stream()
                .map(optionDTO -> toOptionEntity(optionDTO, question))
                .collect(Collectors.toList());

        question.setOptions(options);

        return question;
    }

    private static Options toOptionEntity(OptionDTO dto, Question question) {
        Options option = new Options();
        option.setQuestion(question);
        option.setOptionIndex(dto.getIndex());
        option.setText(dto.getText());
        option.setCorrect(dto.isCorrect());
        return option;
    }
}