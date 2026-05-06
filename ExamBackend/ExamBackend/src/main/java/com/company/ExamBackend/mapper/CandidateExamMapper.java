package com.company.ExamBackend.mapper;

import com.company.ExamBackend.dto.CandidateExamDTO;
import com.company.ExamBackend.dto.CandidateOptionDTO;
import com.company.ExamBackend.dto.CandidateQuestionDTO;
import com.company.ExamBackend.model.Answer;
import com.company.ExamBackend.model.Exam;
import com.company.ExamBackend.model.Option;
import com.company.ExamBackend.model.Question;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class CandidateExamMapper {

    public CandidateExamDTO toDTO(
            Exam exam,
            List<Question> questions
    ) {
        return CandidateExamDTO.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .questions(questions.stream()
                        .map(this::toQuestionDTO)
                        .collect(Collectors.toList()))
                .build();
    }

    public CandidateExamDTO toResumeDTO(
            Exam exam,
            List<Question> questions,
            List<Answer> savedAnswers
    ) {
        Set<String> answeredQuestionIds = savedAnswers.stream()
                .map(answer -> answer.getQuestion().getId())
                .collect(Collectors.toSet());

        return CandidateExamDTO.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .duration(exam.getDuration()) // Don't forget duration
                .questions(questions.stream()
                        .map(q -> toCandidateQuestionDTO(q, answeredQuestionIds))
                        .collect(Collectors.toList()))
                .build();
    }

    private CandidateQuestionDTO toCandidateQuestionDTO(Question question, Set<String> answeredQuestionIds) {
        return CandidateQuestionDTO.builder()
                .id(question.getId())
                .text(question.getText())
                .marks(question.getMarks())
                .isChosen(answeredQuestionIds.contains(question.getId()))
                .options(question.getOptions().stream()
                        .map(this::toOptionDTO)
                        .collect(Collectors.toList()))
                .build();
    }

    private CandidateQuestionDTO toQuestionDTO(Question question) {
        return CandidateQuestionDTO.builder()
                .id(question.getId())
                .text(question.getText())
                .marks(question.getMarks())
                .options(question.getOptions().stream()
                        .map(this::toOptionDTO)
                        .collect(Collectors.toList()))
                .build();
    }

    private CandidateOptionDTO toOptionDTO(Option option) {
        return CandidateOptionDTO.builder()
                .id(option.getId())
                .text(option.getText())
                .optionIndex(option.getOptionIndex())
                .build();
    }
}