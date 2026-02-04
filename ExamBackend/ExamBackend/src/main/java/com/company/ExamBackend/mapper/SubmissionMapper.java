package com.company.ExamBackend.mapper;

import com.company.ExamBackend.dto.*;
import com.company.ExamBackend.model.Answer;
import com.company.ExamBackend.model.Exam;
import com.company.ExamBackend.model.Question;
import com.company.ExamBackend.model.Submission;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public class SubmissionMapper {
    public static Submission toNewEntity(StartExamRequestDTO dto, Exam exam) {
        Submission submission = new Submission();
        submission.setExam(exam);
        submission.setCandidateName(dto.getCandidateName());
        submission.setCandidateEmail(dto.getCandidateEmail());
        submission.setLocation(dto.getLocation());
        submission.setCreatedAt(Instant.now());
        submission.setStatus("IN_PROGRESS");
        submission.setViolations(0);
        submission.setScore(0.0f);
        return submission;
    }

    public static SubmissionResponseDTO toResponseDTO(Submission submission) {
        return SubmissionResponseDTO.builder().id(submission.getId()).candidateName(submission.getCandidateName()).candidateEmail(submission.getCandidateEmail()).score(submission.getScore()).timeTaken(submission.getTimeTaken()).submittedAt(submission.getSubmittedAt()).status(submission.getStatus()).violations(submission.getViolations()).build();
    }

    public static List<SubmissionResponseDTO> toDTOList(List<Submission> submissions) {
        return submissions.stream().map(SubmissionMapper::toResponseDTO).toList();
    }

    public static SubmissionDetailsDTO toDetailsDTO(Submission submission, List<Question> questions, List<Answer> answers) {
        SubmissionDetailsDTO dto = new SubmissionDetailsDTO();
        dto.setSubmissionId(submission.getId());
        dto.setCandidateName(submission.getCandidateName());
        dto.setTotalScore(submission.getScore());

        List<QuestionResultDTO> questionResults = questions.stream().map(q -> {
            Answer matchedAnswer = answers.stream().filter(a -> a.getQuestion().getId().equals(q.getId())).findFirst().orElse(null);
            return toQuestionResultDTO(q, matchedAnswer);
        }).toList();
        dto.setQuestions(questionResults);
        return dto;
    }

    private static QuestionResultDTO toQuestionResultDTO(Question question, Answer answer) {
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