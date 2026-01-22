package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.dto.QuestionDTO;
import com.company.ExamBackend.dto.QuestionResponseDTO;
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
    private final OptionRepository optionRepository;
    private final ExamRepository examRepository;

    @Override
    public void saveQuestions(String examId, List<QuestionDTO> questionDTOs) {

        if (!examRepository.existsById(examId)) {
            throw new RuntimeException("Exam not found");
        }

        Exam exam = examRepository.getReferenceById(examId);

        for (QuestionDTO dto : questionDTOs) {
            Question question = QuestionMapper.toEntity(dto);
            question.setParentExam(examRepository.getReferenceById(examId));

            questionRepository.save(question);
        }

        exam.setStatus("SAVED");
        examRepository.save(exam);
    }

    @Override
    public List<QuestionResponseDTO> getQuestionsForExam(String examId) {
        if (!examRepository.existsById(examId)) {
            throw new RuntimeException("Exam not found");
        }
        List<Question> questions = questionRepository.findAllByParentExamIdOrderByIdAsc(examId);
        return QuestionMapper.toResponseDtoList(questions);
    }
}