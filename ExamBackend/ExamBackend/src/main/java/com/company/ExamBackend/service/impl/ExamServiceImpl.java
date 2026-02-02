package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.dto.CreateExamDTO;
import com.company.ExamBackend.dto.ExamResponseDTO;
import com.company.ExamBackend.dto.CandidateExamDTO;
import com.company.ExamBackend.exception.EmailNotFoundException;
import com.company.ExamBackend.exception.ExamNotFoundException;
import com.company.ExamBackend.exception.InvalidActionException;
import com.company.ExamBackend.mapper.ExamMapper;
import com.company.ExamBackend.mapper.CandidateExamMapper;
import com.company.ExamBackend.model.*;
import com.company.ExamBackend.repository.*;
import com.company.ExamBackend.service.EmailService;
import com.company.ExamBackend.service.ExamService;
import jakarta.persistence.EntityManager;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final ExamCandidateRepo examCandidateRepo;
    private final QuestionRepository questionRepository;
    private final EmailService emailService;
    private final SubmissionRepository submissionRepository;
    private final AnswerRepository answerRepository;
    private final OptionRepository optionRepository;
    private final SnapshotRepository snapshotRepository;
    private final EntityManager entityManager;

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

    @Transactional
    @Override
    public void deleteExam(String examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ExamNotFoundException("Exam not found with id: " + examId));

        //Check for two vital criteria: Whether it has been published (Simple deletion before publish)
        //Another is whether it's finished. We don't want to delete an exam while candidate is
        //in middle of it, and other stuff which would cause "Trouble".
        boolean isPublished = "PUBLISHED".equalsIgnoreCase(exam.getStatus());
        boolean isOver = exam.getEndTime().isBefore(java.time.Instant.now());

        // Applying our criteria
        if (isPublished && !isOver) {
            throw new InvalidActionException("Cannot delete a published exam while it is still active.");
        }

        log.debug("Deleting for Exam ID: {}", examId);

        // Deleting submissions for given exam Id.
        List<Submission> submissions = submissionRepository.findByExamId(examId);
        for (Submission sub : submissions) {
            // Deleting associated answers and snapshots
            answerRepository.deleteBySubmissionId(sub.getId());
            snapshotRepository.deleteBySubmissionId(sub.getId());
        }
        submissionRepository.deleteByExamId(examId);

        // Deleting questions
        List<Question> questions = questionRepository.findByParentExamId(examId);
        for (Question q : questions) {
            //Deleting associated options
            optionRepository.deleteByQuestionId(q.getId());
        }
        questionRepository.deleteByParentExamId(examId);

        //Deleting candidates
        examCandidateRepo.deleteByExamId(examId);

        entityManager.flush();
        entityManager.clear();
        Exam clearedExam = examRepository.findById(examId)
                .orElseThrow(() -> new ExamNotFoundException("Exam not found"));

        //Now deleting exam
        examRepository.delete(clearedExam);

        log.debug("Exam {} and all associated data deleted successfully.", examId);
    }

    @Transactional
    @Override
    public void updateExam(String examId, String status) {
        log.info("Starting updateExam for ID: {} with status: {}", examId, status);

        int rowsUpdated = examRepository.updateExamStatus(examId, status);
        if (rowsUpdated == 0) {
            log.error("Exam not found with id: {}", examId);
            throw new ExamNotFoundException("Exam not found with id: " + examId);
        }

        //Checking for published in case we want to add other states later.
        if ("PUBLISHED".equalsIgnoreCase(status)) {
            List<ExamCandidate> candidates = examCandidateRepo.findByExamId(examId); //List of all candiates
            //for a specific exam.
            log.info("Found {} candidates", candidates.size());

            //Parse through each candidate
            for (ExamCandidate candidate : candidates) {
                //Only if candidate is of status UNINVITED,
                if ("UNINVITED".equals(candidate.getStatus())) {
                    try {
                        //Attempt to email
                        log.info("Attempting email to {}", candidate.getEmail());
                        //Refer to sendInvitation from EmailServiceImpl.java
                        emailService.sendInvitation(candidate.getEmail(), candidate.getExam().getTitle());
                        candidate.setStatus("INVITED"); //Set status to invited
                        log.info("Email sent successfully.");
                    } catch (Exception e) {
                        log.error("Email error for candidate: {}", candidate.getEmail(), e);
                    }
                }
            }
            examCandidateRepo.saveAll(candidates);
        }
    }

    @Transactional
    public List<ExamCandidate> assignGroupToExam(String groupId, String examId) {
        // Stops early when exam is not found.
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

    @Override
    public CandidateExamDTO getExamForCandidate(String examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ExamNotFoundException("Exam not found"));
        List<Question> questions = questionRepository.findByParentExamId(examId);
        return CandidateExamMapper.toDTO(exam, questions);
    }
}