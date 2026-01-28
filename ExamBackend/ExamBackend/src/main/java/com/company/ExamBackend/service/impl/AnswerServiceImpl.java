package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.dto.AnswerRequestDTO;
import com.company.ExamBackend.mapper.AnswerMapper;
import com.company.ExamBackend.model.Answer;
import com.company.ExamBackend.model.Option;
import com.company.ExamBackend.model.Question;
import com.company.ExamBackend.model.Submission;
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
                        existingAnswer -> {
                            // UPDATE CASE
                            Option selected = (dto.getOptionId() != null)
                                    ? optionRepository.getReferenceById(dto.getOptionId())
                                    : null;
                            existingAnswer.setSelectedOption(selected);
                            answerRepository.save(existingAnswer);
                        },
                        () -> {
                            Submission submission = submissionRepository.getReferenceById(dto.getSubmissionId());
                            Question question = questionRepository.getReferenceById(dto.getQuestionId());
                            Option option = (dto.getOptionId() != null)
                                    ? optionRepository.getReferenceById(dto.getOptionId())
                                    : null;

                            Answer newAnswer = AnswerMapper.toEntity(submission, question, option);
                            answerRepository.save(newAnswer);
                        }
                );
    }

    @Override
    @Transactional
    public void finalizeSubmission(String submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if ("COMPLETED".equals(submission.getStatus())) {
            return;
        }

        Instant now = Instant.now();
        long seconds = java.time.Duration.between(submission.getCreatedAt(), now).toSeconds();
        int minutesTaken = (int) Math.ceil(seconds / 60.0);

        List<Answer> candidateAnswers = answerRepository.findBySubmissionId(submissionId);
        float totalScore = 0;

        for (Answer answer : candidateAnswers) {
            Option selected = answer.getSelectedOption();
            if (selected != null && selected.isCorrect()) {
                totalScore += answer.getQuestion().getMarks();
            }
        }

        submission.setScore(totalScore);
        submission.setTimeTaken(minutesTaken);
        submission.setSubmittedAt(now);
        submission.setStatus("COMPLETED");

        submissionRepository.save(submission);
    }
}