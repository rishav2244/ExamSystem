package com.company.ExamBackend.mapper;

import com.company.ExamBackend.dto.CandidateExamDTO;
import com.company.ExamBackend.dto.CandidateOptionDTO;
import com.company.ExamBackend.dto.CandidateQuestionDTO;
import com.company.ExamBackend.model.Exam;
import com.company.ExamBackend.model.Option;
import com.company.ExamBackend.model.Question;

import java.util.List;
import java.util.stream.Collectors;

public class CandidateExamMapper {

    public static CandidateExamDTO toDTO(Exam exam, List<Question> questions) {
        return CandidateExamDTO.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .questions(questions.stream()
                        .map(CandidateExamMapper::toQuestionDTO)
                        .collect(Collectors.toList()))
                .build();
    }

    private static CandidateQuestionDTO toQuestionDTO(Question question) {
        return CandidateQuestionDTO.builder()
                .id(question.getId())
                .text(question.getText())
                .marks(question.getMarks())
                .options(question.getOptions().stream()
                        .map(CandidateExamMapper::toOptionDTO)
                        .collect(Collectors.toList()))
                .build();
    }

    private static CandidateOptionDTO toOptionDTO(Option option) {
        return CandidateOptionDTO.builder()
                .id(option.getId())
                .text(option.getText())
                .optionIndex(option.getOptionIndex())
                .build();
    }
}