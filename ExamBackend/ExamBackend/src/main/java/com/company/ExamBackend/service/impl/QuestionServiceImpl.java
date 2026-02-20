package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.dto.QuestionDTO;
import com.company.ExamBackend.dto.QuestionResponseDTO;
import com.company.ExamBackend.exception.ExamNotFoundException;
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
    public void saveQuestions(String examId, List<QuestionDTO> questionDTOs) {
        Exam exam = findExamById(examId);

        questionRepository.deleteByParentExamId(examId);

        List<Question> questions = prepareQuestions(questionDTOs, exam);

        questionRepository.saveAll(questions);
        updateExamStatus(exam, "SAVED");
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionResponseDTO> getQuestionsForExam(String examId) {
        findExamById(examId); // Ensures 404 if exam doesn't exist

        return questionRepository.findAllByParentExamIdOrderByIdAsc(examId)
                .stream()
                .map(questionMapper::toResponseDto)
                .toList();
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
}