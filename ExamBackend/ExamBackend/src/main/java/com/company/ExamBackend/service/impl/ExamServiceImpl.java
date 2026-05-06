package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.dto.*;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Predicate;
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
    public ExamResponseDTO createExam(CreateExamDTO dto, String adminEmail) {

        Users user = findUserByEmail(adminEmail);

        Exam exam = examMapper.toEntity(dto);
        exam.setCreatedBy(user);
        Exam saved = examRepository.save(exam);
        return examMapper.toDTO(saved);
    }

    @Override
    public Page<ExamResponseDTO> getExams(String adminEmail, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("endTime").descending());
        return examRepository.findByCreatedBy_Email(adminEmail, pageable)
                .map(examMapper::toDTO);
    }

    @Override
    public Page<ExamResponseDTO> getExamsByStatus(String status, String adminEmail, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("endTime").descending());

        return examRepository.findByStatusAndCreatedBy_Email(status, adminEmail, pageable)
                .map(examMapper::toDTO);
    }

    @Transactional
    @Override
    public void deleteExam(String examId, String adminEmail) {
        Exam exam = findExamByIdAndOwner(examId, adminEmail);

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
    public void updateExam(String examId, String status, String adminEmail) {
        log.info("Starting updateExam for ID: {} with status: {}", examId, status);

        //Update the status in the DB
        persistStatusUpdate(examId, status);

        //Handle side effects (like invitations)
        if ("PUBLISHED".equalsIgnoreCase(status)) {
            sendInvitationsToUninvitedCandidates(examId,adminEmail);
        }
    }

    @Override
    @Transactional
    public String assignGroupToExam(String groupId, String examId, String adminEmail) {
        Exam exam = findExamById(examId);
        int pageSize = 100;
        int totalAssigned = 0;
        Page<Users> usersPage;

        do {
            usersPage = examCandidateRepo.findUsersInGroupNotInExam(groupId, examId, PageRequest.of(0, pageSize));

            List<ExamCandidate> newCandidates = usersPage.getContent().stream()
                    .map(user -> {
                        ExamCandidate ec = new ExamCandidate();
                        ec.setExam(exam);
                        ec.setEmail(user.getEmail());
                        ec.setName(user.getName());
                        ec.setStatus("UNINVITED");
                        return ec;
                    }).toList();

            if (!newCandidates.isEmpty()) {
                examCandidateRepo.saveAll(newCandidates);
                totalAssigned += newCandidates.size();
                
                entityManager.flush();
                entityManager.clear();
            }

        } while (usersPage.hasContent());

        return totalAssigned + " new candidates assigned to the exam.";
    }

    @Override
    public CandidateExamDTO getExamForCandidate(
            String candidateEmail,
            String examId,
            String requestType) {
        Exam exam = findExamById(examId);
        List<Question> questions = questionRepository.findByParentExamId(examId);
        Submission submission = submissionRepository.
                findByCandidateEmailAndExamId(candidateEmail, examId).
                orElseThrow(() -> new EmailNotFoundException("Candidate email not found"));
        List<Answer> answers = answerRepository.findBySubmissionIdWithDetails(submission.getId());
        if(requestType.equalsIgnoreCase("Start")) {
            return candidateExamMapper.toDTO(exam, questions);
        }
        return candidateExamMapper.toResumeDTO(exam, questions, answers);
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

    @Override
    @Transactional
    public Page<ExamResponseDTO> searchExam(
            ExamSearchDTO examSearchDTO,
            String adminEmail,
            int page,
            int size){
        Sort sort = Sort.by("endTime").descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Exam> examPage = examRepository.searchByQuery(
                examSearchDTO.getQuery(),
                adminEmail,
                pageable);
        examPage.map(examMapper::toDTO);
        return examPage.map(examMapper::toDTO);
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

    private void sendInvitationsToUninvitedCandidates(String examId, String adminEmail) {
        int pageSize = 50;
        Page<ExamCandidate> uninvitedPage;

        do {
            uninvitedPage = examCandidateRepo.findUninvitedByExamId(examId, PageRequest.of(0, pageSize));

            if (uninvitedPage.hasContent()) {
                uninvitedPage.getContent().forEach(this::sendInvitationEmail);
                examCandidateRepo.saveAll(uninvitedPage.getContent());
                entityManager.flush();
            }

        } while (uninvitedPage.hasContent());
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

    private Exam findExamByIdAndOwner(String examId, String adminEmail) {
        Exam exam = findExamById(examId);
        if (!exam.getCreatedBy().getEmail().equalsIgnoreCase(adminEmail)) {
            log.warn("Unauthorized access attempt: User {} tried to access Exam {}", adminEmail, examId);
            throw new InvalidActionException("You do not have permission to modify this exam.");
        }
        return exam;
    }
}