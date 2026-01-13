package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.dto.CreateExamDTO;
import com.company.ExamBackend.dto.ExamResponseDTO;
import com.company.ExamBackend.exception.EmailNotFoundException;
import com.company.ExamBackend.mapper.ExamMapper;
import com.company.ExamBackend.model.Exam;
import com.company.ExamBackend.model.Users;
import com.company.ExamBackend.repository.ExamRepository;
import com.company.ExamBackend.repository.UserRepository;
import com.company.ExamBackend.service.ExamService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final UserRepository userRepository;

    @Transactional
    @Override
    public ExamResponseDTO createExam(CreateExamDTO dto) {

        Users user = userRepository.findByEmail(dto.getCreatedBy())
                .orElseThrow(() -> new EmailNotFoundException("email not found"));

        Exam exam = new Exam();
        exam.setTitle(dto.getTitle());
        exam.setDuration(dto.getDuration());
        exam.setStartTime(dto.getStartTime());
        exam.setEndTime(dto.getEndTime());
        exam.setStatus(dto.getStatus());
        exam.setCreatedBy(user);
        Exam saved = examRepository.save(exam);
        return ExamMapper.toDTO(saved);
    }

    @Override
    public List<ExamResponseDTO> getExams() {
        return examRepository.findAll().stream()
                .map(ExamMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExamResponseDTO> getExamsByStatus(String status) {
        return examRepository.findByStatus(status).stream()
                .map(ExamMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteExam(String examId) {
        examRepository.deleteById(examId);
    }
}