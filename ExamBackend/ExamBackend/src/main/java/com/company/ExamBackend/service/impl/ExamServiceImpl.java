package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.dto.CreateExamDTO;
import com.company.ExamBackend.dto.ExamResponseDTO;
import com.company.ExamBackend.exception.EmailNotFoundException;
import com.company.ExamBackend.exception.ExamNotFoundException;
import com.company.ExamBackend.mapper.ExamMapper;
import com.company.ExamBackend.model.Exam;
import com.company.ExamBackend.model.ExamCandidate;
import com.company.ExamBackend.model.GroupMember;
import com.company.ExamBackend.model.Users;
import com.company.ExamBackend.repository.ExamCandidateRepo;
import com.company.ExamBackend.repository.ExamRepository;
import com.company.ExamBackend.repository.GroupMemberRepository;
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
    private final GroupMemberRepository groupMemberRepository;
    private final ExamCandidateRepo examCandidateRepo;

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

    @Override
    public void updateExam(String examId, String status) {
        int rowsUpdated = examRepository.updateExamStatus(examId, status);
        if (rowsUpdated == 0) {
            throw new ExamNotFoundException("Exam not found with id: " + examId);
        }
    }

    @Transactional
    public List<ExamCandidate> assignGroupToExam(String groupId, String examId) {
        // Bombs early when exam is not found.
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ExamNotFoundException("Exam not found with id: " + examId));

        // List all existing members for group ID.
        List<GroupMember> sourceMembers = groupMemberRepository.findByGroupId(groupId);

        // Get list of existing emails among candidates FOR specific exam ID.
        // Assures that check is for email repetition in exam, allowing multiple exams per candidate.
        List<String> existingEmails = examCandidateRepo.findByExamId(examId)
                .stream()
                .map(ExamCandidate::getEmail)
                .toList();

        // We make a list of ExamCandidate that we save.
        List<ExamCandidate> newCandidates = sourceMembers.stream()
                .map(GroupMember::getUser) //Maps each user in a group to what we want to work with.
                .filter(user -> !existingEmails.contains(user.getEmail()))// Doesn't allow users from
                // the exam whose email already exists in the lsit for the exam.
                .map(user -> {
                    ExamCandidate ec = new ExamCandidate();
                    ec.setExam(exam);
                    ec.setEmail(user.getEmail());
                    ec.setName(user.getName());
                    ec.setStatus("UNINVITED");
                    return ec;
                }).toList();

        //Make sure we aren't trying to save empty lists.
        if (!newCandidates.isEmpty()) {
            return examCandidateRepo.saveAll(newCandidates);
        }

        return List.of();
    }
}