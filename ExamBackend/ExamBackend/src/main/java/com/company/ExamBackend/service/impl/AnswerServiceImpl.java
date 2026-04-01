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
import com.company.ExamBackend.service.EmailService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class AnswerServiceImpl implements AnswerService {

    private final AnswerRepository answerRepository;
    private final SubmissionRepository submissionRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;

    private final EmailService emailService;

    @Override
    @Transactional
    public void saveOrUpdateAnswer(AnswerRequestDTO dto) {
        // Check if an answer already exists for this question
        Optional<Answer> existingAnswer = answerRepository
                .findBySubmissionIdAndQuestionId(dto.getSubmissionId(), dto.getQuestionId());

        if (dto.getOptionId() == null || dto.getOptionId().isBlank()) {
            // Candidate de-selects answer(null option) so we delete
            existingAnswer.ifPresent(answerRepository::delete);
        } else {
            // Candidate clicks option or changes it.
            existingAnswer.ifPresentOrElse(
                    existing -> updateExistingAnswer(existing, dto.getOptionId()),
                    () -> createNewAnswer(dto)
            );
        }
    }

    @Override
    @Transactional
    public void finalizeSubmission(String submissionId, String candidateEmail) {
        Submission submission = submissionRepository.findByIdAndCandidateEmail(submissionId, candidateEmail);

        if (submission == null) {
            throw new SubmissionNotFoundException("Submission not found or access denied.");
        }

        if ("COMPLETED".equals(submission.getStatus())) return;

        List<Object[]> evaluatedResult = answerRepository.calculateResult(submissionId, candidateEmail);

        if (evaluatedResult.isEmpty()) {
            throw new RuntimeException("Evaluation failed to produce a result.");
        }

        double score = ((Number) evaluatedResult.get(0)[0]).doubleValue();
        boolean passed = (boolean) evaluatedResult.get(0)[1];

        int minutesTaken = calculateTimeTaken(submission.getCreatedAt());
        applyFinalSubmissionDetails(submission, score, minutesTaken, passed);

        emailService.sendExamCompletionConfirmation(submission.getCandidateEmail(), submission.getExam().getTitle());
    }

    // ======================================================================================
    // Helper methods
    // ======================================================================================

    @Deprecated
    private double calculateEarnedScore(List<Answer> answers) {
        return answers.stream()
                .filter(a -> a.getSelectedOption() != null && a.getSelectedOption().isCorrect())
                .mapToDouble(a -> a.getQuestion().getMarks())
                .sum();
    }

    @Deprecated
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