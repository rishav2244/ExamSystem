package com.company.ExamBackend.mapper;

import com.company.ExamBackend.dto.OptionDTO;
import com.company.ExamBackend.dto.QuestionDTO;
import com.company.ExamBackend.model.Option;
import com.company.ExamBackend.model.Question;

import java.util.ArrayList;
import java.util.List;

//public class QuestionMapper {
//
//    public static Question toEntity(QuestionDTO dto) {
//
//        Question question = new Question();
//        question.setText(dto.getText());
//        question.setMarks(dto.getMarks());
//
//        List<Option> options = new ArrayList<>();
//
//        for (OptionDTO oDto : dto.getOptions()) {
//            Option option = new Option();
//            option.setText(oDto.getText());
//            option.setOptionIndex(oDto.getOptionIndex());
//            option.setCorrect(
//                    oDto.getOptionIndex() == dto.getCorrectOptionIndex()
//            );
//            option.setQuestion(question);
//
//            options.add(option);
//        }
//
//        question.setOptions(options);
//        return question;
//    }
//}

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
}