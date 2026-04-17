package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.dto.ExamSetupDTO;
import com.company.ExamBackend.dto.QuestionDTO;
import com.company.ExamBackend.dto.QuestionResponseDTO;
import com.company.ExamBackend.exception.ExamNotFoundException;
import com.company.ExamBackend.exception.InvalidActionException;
import com.company.ExamBackend.mapper.QuestionMapper;
import com.company.ExamBackend.model.Exam;
import com.company.ExamBackend.model.Question;
import com.company.ExamBackend.repository.ExamRepository;
import com.company.ExamBackend.repository.OptionRepository;
import com.company.ExamBackend.repository.QuestionRepository;
import com.company.ExamBackend.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository questionRepository;
    private final ExamRepository examRepository;

    private final QuestionMapper questionMapper;

    @Override
    @Transactional
    public void saveQuestions(
            String examId,
            ExamSetupDTO examSetupDTO,
            String adminEmail) {
        Exam exam = findExamById(examId);
        if(!exam.getCreatedBy().getEmail().equals(adminEmail)){
            throw new InvalidActionException("Email does not match exam creator.");
        }
        questionRepository.deleteByParentExamId(examId);

        int totalScore = examSetupDTO.getQuestions().stream()
                .mapToInt(QuestionDTO::getMarks)
                .sum();

        exam.setTotalScore(totalScore);
        exam.setCutoff(examSetupDTO.getCutoff());
        List<Question> questions = prepareQuestions(examSetupDTO.getQuestions(), exam);
        questionRepository.saveAll(questions);
        updateExamStatus(exam, "SAVED");
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionResponseDTO> getQuestionsForExam(
            String examId,
            String adminEmail) {
        validateExamExists(examId);
        List<Question> questions = questionRepository.findAllByExamIdWithOptions(examId, adminEmail);
        return questionMapper.toResponseDtoList(questions);
    }

    // ======================================================================================
    // Helper methods
    // ======================================================================================

    private Exam findExamById(String examId) {
        return examRepository.findById(examId)
                .orElseThrow(() -> new ExamNotFoundException("Exam with ID " + examId + " not found."));
    }

    private List<Question> prepareQuestions(List<QuestionDTO> dtos, Exam exam) {
        return dtos.stream()
                .map(dto -> {
                    Question question = questionMapper.toEntity(dto);
                    question.setParentExam(exam);
                    return question;
                })
                .toList();
    }

    private void updateExamStatus(Exam exam, String status) {
        exam.setStatus(status);
        examRepository.save(exam);
    }

    private void validateExamExists(String examId) {
        if (!examRepository.existsById(examId)) {
            throw new ExamNotFoundException("Exam with ID " + examId + " not found.");
        }
    }
}