package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.dto.AnswerRequestDTO;
import com.company.ExamBackend.exception.QuestionNotFoundException;
import com.company.ExamBackend.exception.SubmissionNotFoundException;
import com.company.ExamBackend.mapper.AnswerMapper;
import com.company.ExamBackend.model.*;
import com.company.ExamBackend.repository.AnswerRepository;
import com.company.ExamBackend.repository.OptionRepository;
import com.company.ExamBackend.repository.QuestionRepository;
import com.company.ExamBackend.repository.SubmissionRepository;
import com.company.ExamBackend.service.AnswerService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@AllArgsConstructor
public class AnswerServiceImpl implements AnswerService {

    private final AnswerRepository answerRepository;
    private final SubmissionRepository submissionRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;

    @Override
    @Transactional
    public void saveOrUpdateAnswer(AnswerRequestDTO dto) {
        answerRepository.findBySubmissionIdAndQuestionId(dto.getSubmissionId(), dto.getQuestionId())
                .ifPresentOrElse(
                        existing -> updateExistingAnswer(existing, dto.getOptionId()),
                        () -> createNewAnswer(dto)
                );
    }

    @Override
    @Transactional
    public void finalizeSubmission(String submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new SubmissionNotFoundException("Submission not found"));

        if ("COMPLETED".equals(submission.getStatus())) return;

        List<Answer> candidateAnswers = answerRepository.findBySubmissionIdWithDetails(submissionId);

        Exam exam = submission.getExam();
        int totalPossibleMarks = exam.getTotalScore();
        double cutoffPercentage = exam.getCutoff();

        double earnedScore = calculateEarnedScore(candidateAnswers);
        int minutesTaken = calculateTimeTaken(submission.getCreatedAt());

        boolean passed = checkPassStatus(earnedScore, totalPossibleMarks, cutoffPercentage);

        applyFinalSubmissionDetails(submission, earnedScore, minutesTaken, passed);
    }

    // ======================================================================================
    // Modularized Helpers
    // ======================================================================================

    private double calculateEarnedScore(List<Answer> answers) {
        return answers.stream()
                .filter(a -> a.getSelectedOption() != null && a.getSelectedOption().isCorrect())
                .mapToDouble(a -> a.getQuestion().getMarks())
                .sum();
    }

    private boolean checkPassStatus(double earned, int total, double cutoffPercentage) {
        if (total == 0) return false;

        // Calculate percentage: (Earned / Total) * 100
        double percentageObtained = (earned / (double) total) * 100.0;

        return percentageObtained >= cutoffPercentage;
    }

    private int calculateTimeTaken(Instant startTime) {
        long seconds = java.time.Duration.between(startTime, Instant.now()).toSeconds();
        return (int) Math.ceil(seconds / 60.0);
    }

    private void applyFinalSubmissionDetails(Submission s, double score, int time, boolean passed) {
        s.setScore(score);
        s.setTimeTaken(time);
        s.setPassed(passed);
        s.setSubmittedAt(Instant.now());
        s.setStatus("COMPLETED");
        submissionRepository.save(s);
    }

    private void updateExistingAnswer(Answer existing, String optionId) {
        Option selected = (optionId != null)
                ? optionRepository.findById(optionId).orElse(null)
                : null;
        existing.setSelectedOption(selected);
    }

    private void createNewAnswer(AnswerRequestDTO dto) {
        Submission s = submissionRepository.findById(dto.getSubmissionId()).orElseThrow();
        Question q = questionRepository.findById(dto.getQuestionId()).orElseThrow();
        Option o = (dto.getOptionId() != null) ? optionRepository.findById(dto.getOptionId()).orElse(null) : null;
        answerRepository.save(AnswerMapper.toEntity(s, q, o));
    }
}