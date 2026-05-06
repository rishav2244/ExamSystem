package com.company.ExamBackend.mapper;

import com.company.ExamBackend.dto.CandidateExamDTO;
import com.company.ExamBackend.dto.CandidateOptionDTO;
import com.company.ExamBackend.dto.CandidateQuestionDTO;
import com.company.ExamBackend.model.Answer;
import com.company.ExamBackend.model.Exam;
import com.company.ExamBackend.model.Option;
import com.company.ExamBackend.model.Question;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class CandidateExamMapper {

    public CandidateExamDTO toDTO(Exam exam, List<Question> questions) {
        return CandidateExamDTO.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .duration(exam.getDuration())
                .questions(questions.stream()
                        .map(this::toQuestionDTO)
                        .collect(Collectors.toList()))
                .build();
    }

    public CandidateExamDTO toResumeDTO(
            Exam exam,
            List<Question> questions,
            List<Answer> savedAnswers,
            Instant startedAt) {
        // Map of QuestionID -> SelectedOptionID
        Map<String, String> selectedOptionsMap = savedAnswers.stream()
                .filter(a -> a.getQuestion() != null && a.getSelectedOption() != null)
                .collect(Collectors.toMap(
                        a -> a.getQuestion().getId(),
                        a -> a.getSelectedOption().getId()
                ));

        return CandidateExamDTO.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .duration(exam.getDuration())
                .startTime(startedAt) // Crucial for the frontend timer
                .endTime(exam.getEndTime()) // Crucial for the hard-stop limit
                .questions(questions.stream()
                        .map(q -> toCandidateQuestionDTO(q, selectedOptionsMap))
                        .collect(Collectors.toList()))
                .build();
    }

    private CandidateQuestionDTO toCandidateQuestionDTO(Question question, Map<String, String> selectedOptionsMap) {
        String selectedOptionId = selectedOptionsMap.get(question.getId());

        return CandidateQuestionDTO.builder()
                .id(question.getId())
                .text(question.getText())
                .marks(question.getMarks())
                .options(question.getOptions().stream()
                        .map(opt -> toOptionDTOWithSelection(opt, selectedOptionId))
                        .collect(Collectors.toList()))
                .build();
    }

    private CandidateQuestionDTO toQuestionDTO(Question question) {
        return CandidateQuestionDTO.builder()
                .id(question.getId())
                .text(question.getText())
                .marks(question.getMarks())
                .options(question.getOptions().stream()
                        .map(opt -> toOptionDTOWithSelection(opt, null)) // No selection for "Start"
                        .collect(Collectors.toList()))
                .build();
    }

    private CandidateOptionDTO toOptionDTOWithSelection(Option option, String selectedOptionId) {
        return CandidateOptionDTO.builder()
                .id(option.getId())
                .text(option.getText())
                .optionIndex(option.getOptionIndex())
                .chosen(option.getId().equals(selectedOptionId)) // True if this ID matches what's in the DB
                .build();
    }
}