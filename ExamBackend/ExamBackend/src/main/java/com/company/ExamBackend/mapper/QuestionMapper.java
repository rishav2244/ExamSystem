package com.company.ExamBackend.mapper;

import com.company.ExamBackend.dto.OptionDTO;
import com.company.ExamBackend.dto.OptionResponseDTO;
import com.company.ExamBackend.dto.QuestionDTO;
import com.company.ExamBackend.dto.QuestionResponseDTO;
import com.company.ExamBackend.model.Option;
import com.company.ExamBackend.model.Question;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class QuestionMapper {

    public static Question toEntity(QuestionDTO dto) {
        Question question = new Question();
        question.setText(dto.getText());
        question.setMarks(dto.getMarks());

        List<Option> options = new ArrayList<>();

        for (OptionDTO oDto : dto.getOptions()) {
            Option option = new Option();
            option.setText(oDto.getText());
            option.setOptionIndex(oDto.getOptionIndex());
            option.setCorrect(oDto.getOptionIndex() == dto.getCorrectOptionIndex());

            option.setQuestion(question);

            options.add(option);
        }

        question.setOptions(options);
        return question;
    }

    public static QuestionResponseDTO toResponseDto(Question question) {

        int correctIndex = question.getOptions().stream()
                .filter(Option::isCorrect)
                .mapToInt(Option::getOptionIndex)
                .findFirst()
                .orElse(-1);

        List<OptionResponseDTO> optionDtos = question.getOptions().stream()
                .sorted(Comparator.comparingInt(Option::getOptionIndex))
                .map(opt -> OptionResponseDTO.builder()
                        .optionIndex(opt.getOptionIndex())
                        .text(opt.getText())
                        .build())
                .collect(Collectors.toList());

        return QuestionResponseDTO.builder()
                .id(question.getId())
                .text(question.getText())
                .marks(question.getMarks())
                .correctOptionIndex(correctIndex)
                .options(optionDtos)
                .build();
    }

    public static List<QuestionResponseDTO> toResponseDtoList(List<Question> questions) {
        return questions.stream()
                .map(QuestionMapper::toResponseDto)
                .collect(Collectors.toList());
    }
}