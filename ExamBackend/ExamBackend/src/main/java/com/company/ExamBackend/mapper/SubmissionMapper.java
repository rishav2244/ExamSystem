package com.company.ExamBackend.mapper;

import com.company.ExamBackend.dto.*;
import com.company.ExamBackend.model.Answer;
import com.company.ExamBackend.model.Exam;
import com.company.ExamBackend.model.Question;
import com.company.ExamBackend.model.Submission;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class SubmissionMapper {

    public Submission toNewEntity(StartExamRequestDTO dto, Exam exam) {
        Submission submission = new Submission();
        submission.setExam(exam);
        submission.setCandidateName(dto.getCandidateName());
        submission.setCandidateEmail(dto.getCandidateEmail());
        submission.setLocation(dto.getLocation());
        submission.setStatus("IN_PROGRESS");
        submission.setViolations(0);
        submission.setScore(0.0);
        submission.setPassed(false);
        return submission;
    }

    public SubmissionResponseDTO toResponseDTO(Submission submission) {
        return SubmissionResponseDTO.builder()
                .id(submission.getId())
                .candidateName(submission.getCandidateName())
                .candidateEmail(submission.getCandidateEmail())
                .score(submission.getScore())
                .timeTaken(submission.getTimeTaken())
                .submittedAt(submission.getSubmittedAt())
                .status(submission.getStatus())
                .passed(submission.isPassed())
                .violations(submission.getViolations())
                .build();
    }

    public List<SubmissionResponseDTO> toDTOList(List<Submission> submissions) {
        return submissions.stream().map(this::toResponseDTO).toList();
    }

    public SubmissionDetailsDTO toDetailsDTO(Submission submission, List<Question> questions, List<Answer> answers) {
        SubmissionDetailsDTO dto = new SubmissionDetailsDTO();
        dto.setSubmissionId(submission.getId());
        dto.setCandidateName(submission.getCandidateName());
        dto.setTotalScore(submission.getScore());    //This is actual score btw. Yes nomenclature is poor.

        Map<String, Answer> answerMap = answers.stream()
                .collect(Collectors.toMap(a -> a.getQuestion().getId(), a -> a));

        List<QuestionResultDTO> questionResults = questions.stream()
                .map(q -> toQuestionResultDTO(q, answerMap.get(q.getId())))
                .toList();

        dto.setQuestions(questionResults);
        return dto;
    }

    private QuestionResultDTO toQuestionResultDTO(Question question, Answer answer) {
        QuestionResultDTO qr = new QuestionResultDTO();
        qr.setQuestionId(question.getId());
        qr.setQuestionText(question.getText());
        qr.setMarks(question.getMarks());
        qr.setOptions(question.getOptions().stream().map(opt -> {
            ReviewOptionDTO optDto = new ReviewOptionDTO();
            optDto.setId(opt.getId());
            optDto.setOptionIndex(opt.getOptionIndex());
            optDto.setText(opt.getText());
            optDto.setCorrect(opt.isCorrect());
            return optDto;
        }).toList());

        if (answer != null && answer.getSelectedOption() != null) {
            qr.setSelectedOptionId(answer.getSelectedOption().getId());
            qr.setCorrect(answer.getSelectedOption().isCorrect());
        } else {
            qr.setSelectedOptionId(null);
            qr.setCorrect(false);
        }
        return qr;
    }
}