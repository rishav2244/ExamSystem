package com.company.ExamBackend.mapper;

import com.company.ExamBackend.dto.OptionDTO;
import com.company.ExamBackend.dto.OptionResponseDTO;
import com.company.ExamBackend.dto.QuestionDTO;
import com.company.ExamBackend.dto.QuestionResponseDTO;
import com.company.ExamBackend.model.Option;
import com.company.ExamBackend.model.Question;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
public class QuestionMapper {

    public Question toEntity(QuestionDTO dto) {
        Question question = new Question();
        question.setText(dto.getText());
        question.setMarks(dto.getMarks());

        if (dto.getOptions() != null) {
            question.setOptions(dto.getOptions().stream()
                    .map(oDto -> mapToOption(oDto, dto.getCorrectOptionIndex(), question))
                    .toList());
        }
        return question;
    }

    private Option mapToOption(OptionDTO oDto, int correctIndex, Question question) {
        Option option = new Option();
        option.setText(oDto.getText());
        option.setOptionIndex(oDto.getOptionIndex());
        option.setCorrect(oDto.getOptionIndex() == correctIndex);
        option.setQuestion(question);
        return option;
    }

    public QuestionResponseDTO toResponseDto(Question question) {
        return QuestionResponseDTO.builder()
                .id(question.getId())
                .text(question.getText())
                .marks(question.getMarks())
                .correctOptionIndex(findCorrectIndex(question))
                .options(mapOptionResponses(question))
                .build();
    }

    private int findCorrectIndex(Question question) {
        return question.getOptions().stream()
                .filter(Option::isCorrect)
                .mapToInt(Option::getOptionIndex)
                .findFirst()
                .orElse(-1);
    }

    private List<OptionResponseDTO> mapOptionResponses(Question question) {
        return question.getOptions().stream()
                .sorted(Comparator.comparingInt(Option::getOptionIndex))
                .map(opt -> OptionResponseDTO.builder()
                        .optionIndex(opt.getOptionIndex())
                        .text(opt.getText())
                        .build())
                .toList();
    }

    public List<QuestionResponseDTO> toResponseDtoList(List<Question> questions) {
        return questions.stream()
                .map(this::toResponseDto)
                .toList();
    }
}