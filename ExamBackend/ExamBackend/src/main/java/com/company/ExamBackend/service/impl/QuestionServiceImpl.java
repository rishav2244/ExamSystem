package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.dto.QuestionDTO;
import com.company.ExamBackend.dto.QuestionResponseDTO;
import com.company.ExamBackend.mapper.QuestionMapper;
import com.company.ExamBackend.model.Exam;
import com.company.ExamBackend.model.Question;
import com.company.ExamBackend.repository.ExamRepository;
import com.company.ExamBackend.repository.QuestionRepository;
import com.company.ExamBackend.service.QuestionService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository questionRepository;
    private final ExamRepository examRepository;

    @Transactional
    @Override
    public void saveQuestionsForExam(String examId, List<QuestionDTO> questions) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        List<Question> entities = questions.stream().map(dto -> {
            Question q = new Question();
            q.setText(dto.getText());
            q.setOptions(dto.getOptions());
            q.setCorrectOption(dto.getCorrectOption());
            q.setMarks(dto.getMarks());
            q.setParentExam(exam);
            return q;
        }).collect(Collectors.toList());

        questionRepository.saveAll(entities);
    }

    @Override
    public List<QuestionResponseDTO> getQuestionsByExam(String examId) {
        return questionRepository.findByParentExamId(examId).stream()
                .map(QuestionMapper::toDTO)
                .collect(Collectors.toList());
    }
}