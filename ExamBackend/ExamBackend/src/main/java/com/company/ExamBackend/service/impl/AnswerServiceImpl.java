package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.dto.AnswerRequestDTO;
import com.company.ExamBackend.exception.QuestionNotFoundException;
import com.company.ExamBackend.exception.SubmissionNotFoundException;
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
        // Check if answer exists
        answerRepository.findBySubmissionIdAndQuestionId(dto.getSubmissionId(), dto.getQuestionId())
                .ifPresentOrElse(//If present
                        existingAnswer -> {//See if option exists. Then find option ID and
                            Option selected = (dto.getOptionId() != null)// set selection option to that.
                                    ? optionRepository.findById(dto.getOptionId()).orElse(null)
                                    : null;
                            existingAnswer.setSelectedOption(selected);
                        },
                        () -> {//If absent, get submission id assuming it exists and set respective question id and
                            Submission submission = submissionRepository.findById(dto.getSubmissionId())//option id
                                    .orElseThrow(() -> new SubmissionNotFoundException("Submission not found"));
                            Question question = questionRepository.findById(dto.getQuestionId())
                                    .orElseThrow(() -> new QuestionNotFoundException("Question not found"));
                            Option option = (dto.getOptionId() != null)
                                    ? optionRepository.findById(dto.getOptionId()).orElse(null)
                                    : null;
                            //Of course, create answer object to save in db.
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
        //If already COMPLETED then don't resubmit.
        if ("COMPLETED".equals(submission.getStatus())) {
            return;
        }
        //Else start setting things
        Instant now = Instant.now();
        long seconds = java.time.Duration.between(submission.getCreatedAt(), now).toSeconds();
        int minutesTaken = (int) Math.ceil(seconds / 60.0);

        List<Answer> candidateAnswers = answerRepository.findBySubmissionId(submissionId);
        float totalScore = 0;
        //Calculates total score
        for (Answer answer : candidateAnswers) {
            Option selected = answer.getSelectedOption();
            if (selected != null && selected.isCorrect()) {
                totalScore += answer.getQuestion().getMarks();
            }
        }
        //Assign remaining fields.
        submission.setScore(totalScore);
        submission.setTimeTaken(minutesTaken);
        submission.setSubmittedAt(now);
        submission.setStatus("COMPLETED");
        //Save data.
        submissionRepository.save(submission);
    }
}