package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.dto.OptionDTO;
import com.company.ExamBackend.dto.QuestionDTO;
import com.company.ExamBackend.model.Exam;
import com.company.ExamBackend.model.Option;
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

        for (QuestionDTO dto : questionDTOs) {

            Question question = new Question();
            question.setText(dto.getText());
            question.setMarks(dto.getMarks());

            Exam examRef = new Exam();
            examRef.setId(examId);
            question.setParentExam(examRef);

            Question savedQuestion = questionRepository.save(question);

            for (OptionDTO oDto : dto.getOptions()) {
                Option option = new Option();
                option.setText(oDto.getText());
                option.setOptionIndex(oDto.getOptionIndex());
                option.setCorrect(
                        oDto.getOptionIndex() == dto.getCorrectOptionIndex()
                );
                option.setQuestion(savedQuestion);

                optionRepository.save(option);
            }
        }
    }
}