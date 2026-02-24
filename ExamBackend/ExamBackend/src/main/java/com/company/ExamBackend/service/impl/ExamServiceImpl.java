package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.dto.CandidateResponseDTO;
import com.company.ExamBackend.dto.CreateExamDTO;
import com.company.ExamBackend.dto.ExamResponseDTO;
import com.company.ExamBackend.dto.CandidateExamDTO;
import com.company.ExamBackend.exception.EmailNotFoundException;
import com.company.ExamBackend.exception.ExamNotFoundException;
import com.company.ExamBackend.exception.InvalidActionException;
import com.company.ExamBackend.mapper.CandidateMapper;
import com.company.ExamBackend.mapper.ExamMapper;
import com.company.ExamBackend.mapper.CandidateExamMapper;
import com.company.ExamBackend.model.*;
import com.company.ExamBackend.repository.*;
import com.company.ExamBackend.service.EmailService;
import com.company.ExamBackend.service.ExamService;
import com.company.ExamBackend.service.SnapshotService;
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
    private final EntityManager entityManager;

    private final CandidateMapper candidateMapper;
    private final ExamMapper examMapper;
    private final CandidateExamMapper candidateExamMapper;

    private final SnapshotService snapshotService;

    @Transactional
    @Override
    public ExamResponseDTO createExam(CreateExamDTO dto) {

        Users user = findUserByEmail(dto.getCreatedBy());

        Exam exam = new Exam();
        exam.setTitle(dto.getTitle());
        exam.setDuration(dto.getDuration());
        exam.setStartTime(dto.getStartTime());
        exam.setEndTime(dto.getEndTime());
        exam.setStatus(dto.getStatus());
        exam.setCreatedBy(user);
        exam.setCutoff(dto.getCutoff());
        Exam saved = examRepository.save(exam);
        return examMapper.toDTO(saved);
    }

    @Override
    public List<ExamResponseDTO> getExams() {
        return examRepository.findAll().stream()
                .map(examMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExamResponseDTO> getExamsByStatus(String status) {
        return examRepository.findByStatus(status).stream()
                .map(examMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public void deleteExam(String examId) {
        Exam exam = findExamById(examId);

        //Validate if deletion is allowed
        validateExamDeletion(exam);

        log.debug("Deleting all associated data for Exam ID: {}", examId);

        //Cascade cleanup of related entities
        cleanupSubmissions(examId);
        cleanupQuestionsAndOptions(examId);
        cleanupCandidates(examId);

        entityManager.flush();
        entityManager.clear();

        //Final deletion
        examRepository.delete(exam);
        log.debug("Exam {} deleted successfully.", examId);
    }

    @Transactional
    @Override
    public void updateExam(String examId, String status) {
        log.info("Starting updateExam for ID: {} with status: {}", examId, status);

        //Update the status in the DB
        persistStatusUpdate(examId, status);

        //Handle side effects (like invitations)
        if ("PUBLISHED".equalsIgnoreCase(status)) {
            sendInvitationsToUninvitedCandidates(examId);
        }
    }

    @Override
    @Transactional
    public List<CandidateResponseDTO> assignGroupToExam(String groupId, String examId) {
        // Stops early when exam is not found.
        Exam exam = findExamById(examId);

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
                // the exam whose email already exists in the list for the exam.
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
            List<ExamCandidate> saved = examCandidateRepo.saveAll(newCandidates);
            return candidateMapper.toDTOList(saved);
        }

        return List.of();
    }

    @Override
    public CandidateExamDTO getExamForCandidate(String examId) {
        Exam exam = findExamById(examId);
        List<Question> questions = questionRepository.findByParentExamId(examId);
        return candidateExamMapper.toDTO(exam, questions);
    }

    @Override
    @Transactional
    public void resendInvitation(String candidateId) {
        ExamCandidate candidate = examCandidateRepo.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        sendInvitationEmail(candidate);

        // Save the status change (if it was UNINVITED, it's now INVITED)
        examCandidateRepo.save(candidate);
    }

    // ======================================================================================
    // Helper methods
    // ======================================================================================

    private void validateExamDeletion(Exam exam) {
        boolean isPublished = "PUBLISHED".equalsIgnoreCase(exam.getStatus());
        boolean isOver = exam.getEndTime().isBefore(java.time.Instant.now());

        if (isPublished && !isOver) {
            throw new InvalidActionException("Cannot delete a published exam while it is still active.");
        }
    }

    private void cleanupSubmissions(String examId) {
        List<Submission> submissions = submissionRepository.findByExamId(examId);
        for (Submission sub : submissions) {
            answerRepository.deleteBySubmissionId(sub.getId());
            snapshotService.deleteSnapshotsForSubmission(sub.getId());
        }
        // Flush child records (snapshots/answers) before removing the parent (submission)
        entityManager.flush();
        submissionRepository.deleteByExamId(examId);
    }

    private void cleanupQuestionsAndOptions(String examId) {
        List<Question> questions = questionRepository.findByParentExamId(examId);
        for (Question q : questions) {
            optionRepository.deleteByQuestionId(q.getId());
        }
        questionRepository.deleteByParentExamId(examId);
    }

    private void cleanupCandidates(String examId) {
        examCandidateRepo.deleteByExamId(examId);
    }

    private Exam findExamById(String id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new ExamNotFoundException("Exam not found with id: " + id));
    }

    private Users findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EmailNotFoundException("User with email " + email + " not found."));
    }

    private void persistStatusUpdate(String examId, String status) {
        int rowsUpdated = examRepository.updateExamStatus(examId, status);
        if (rowsUpdated == 0) {
            throw new ExamNotFoundException("Exam not found with id: " + examId);
        }
    }

    private void sendInvitationsToUninvitedCandidates(String examId) {
        List<ExamCandidate> candidates = examCandidateRepo.findByExamId(examId);
        log.info("Processing invitations for {} candidates", candidates.size());

        for (ExamCandidate candidate : candidates) {
            if ("UNINVITED".equals(candidate.getStatus())) {
                sendInvitationEmail(candidate);
            }
        }
        examCandidateRepo.saveAll(candidates);
    }

    private void sendInvitationEmail(ExamCandidate candidate) {
        try {
            emailService.sendInvitation(candidate.getEmail(), candidate.getExam().getTitle());
            candidate.setStatus("INVITED");
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", candidate.getEmail(), e.getMessage());
            // We don't throw an exception here because we don't want one
            // failed email to stop the entire publishing process.
        }
    }
}