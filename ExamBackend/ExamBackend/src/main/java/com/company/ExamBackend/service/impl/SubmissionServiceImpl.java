package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.dto.*;
import com.company.ExamBackend.exception.EligibilityException;
import com.company.ExamBackend.exception.ExamNotFoundException;
import com.company.ExamBackend.exception.SubmissionNotFoundException;
import com.company.ExamBackend.mapper.SubmissionMapper;
import com.company.ExamBackend.model.*;
import com.company.ExamBackend.repository.*;
import com.company.ExamBackend.service.EmailService;
import com.company.ExamBackend.service.SubmissionService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {
    private final SubmissionRepository submissionRepository;
    private final ExamRepository examRepository;
    private final ExamCandidateRepo examCandidateRepo;
    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;

    private final SubmissionMapper submissionMapper;

    EmailService  emailService;

    //Check eligibility has two purposes.
    //First purpose is to not let candidate just log off and a come back to an unsubmitted exam, then continue it.
    //While this is already covered in getCandidateDashboard(String email) method, we wish to keep it for now.
    //Second purpose is to prevent candidate from logging into an exam that has already ended.
    //For example, candidate enters dashboard and waits until end time of exam. Then he tries to log into it
    //since the exam is already listed. In that case, candidate should not be able to do so.
    //We also have a case where candidate tries to enter an exam with not enough duration left,
    //following which he'll fail validation again.
    @Override
    public void checkEligibility(String examId, String email) {
        Exam exam = findExamById(examId);
        performEligibilityChecks(exam, email);
    }

    @Override
    @Transactional
    public StartExamResponseDTO startExam(StartExamRequestDTO dto, String email) {
        Exam exam = findExamById(dto.getExamId());

        performEligibilityChecks(exam, email);

        Submission submission = createSubmissionEntity(dto, exam);
        updateCandidateStatus(dto.getExamId(), email, "ATTEMPTED");

        String savedId = submissionRepository.save(submission).getId();
        return new StartExamResponseDTO(savedId, exam.getDuration());
    }

    @Override
    public List<SubmissionResponseDTO> getSubmissionsByExam(String examId, String adminEmail) {
        // Uses your @Query to filter submissions belonging to the admin's exam
        List<Submission> submissions = submissionRepository.findByExamIdAndAdminEmail(examId, adminEmail);
        return submissionMapper.toDTOList(submissions);
    }

    @Override
    public SubmissionDetailsDTO getSubmissionDetails(String submissionId, String adminEmail) {
        // Security check: Only return details if the submission belongs to this admin's exam
        Submission submission = submissionRepository.findByIdAndAdminEmail(submissionId, adminEmail)
                .orElseThrow(() -> new SubmissionNotFoundException("SUBMISSION_NOT_FOUND_OR_ACCESS_DENIED"));

        var questions = questionRepository.findAllByExamIdWithOptions(submission.getExam().getId());
        var answers = answerRepository.findBySubmissionIdWithDetails(submissionId);

        return submissionMapper.toDetailsDTO(submission, questions, answers);
    }

    @Override
    @Transactional
    public void reportViolation(String submissionId) {
        Submission submission = findSubmissionById(submissionId);
        submission.setViolations(submission.getViolations() + 1);
        submissionRepository.save(submission);
    }

    @Override
    public SubmissionsOverviewDTO getSubmissionsOverview(String email) {
        return buildSubmissionsOverviewDTO(email);
    }

    @Override
    @Transactional
    public ResultMailResponseDTO sendResults(String examId, String adminEmail) {
        List<CandidateResultObj> candidateResultObjs = new ArrayList<>();
        List<Object[]> fetchedResults =
                submissionRepository.findResultsToSend(adminEmail, examId);
        for (Object[] result : fetchedResults) {
            candidateResultObjs.add(buildCandidateResultObj(result, examId));
        }
        ResultMailResponseDTO resultMailResponseDTO = emailService.sendResults(candidateResultObjs);

        List<String> failedEmails = resultMailResponseDTO.getEmailInfo().stream()
                .map(EmailFailure::getEmail)
                .toList();

        List<String> successfulEmails = candidateResultObjs.stream()
                .map(CandidateResultObj::getEmail)
                .filter(email -> !failedEmails.contains(email))
                .toList();

        if (!successfulEmails.isEmpty()) {
            submissionRepository.markMultipleAsMailed(examId, successfulEmails);
        }

        return resultMailResponseDTO;
    }

    @Override
    public CandidateSubmissionsOverviewDTO fetchCandidateResults(String candidateEmail){
        List<Object[]> fetchedResults = submissionRepository.getCandidateResults(candidateEmail);
        CandidateSubmissionsOverviewDTO  candidateSubmissionsOverviewDTO = new CandidateSubmissionsOverviewDTO();
        for (Object[] result : fetchedResults) {
            candidateSubmissionsOverviewDTO.
                    getCandidateSubmissionDetailDTO().
                    add(submissionMapper.
                            toCandidateSubmissionDetailDTO(result));
        }
        return candidateSubmissionsOverviewDTO;
    }

    // ======================================================================================
    // Helper Methods
    // ======================================================================================

    private Exam findExamById(String id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new ExamNotFoundException("EXAM_NOT_FOUND"));
    }

    private Submission findSubmissionById(String id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new SubmissionNotFoundException("SUBMISSION_NOT_FOUND"));
    }

    private void performEligibilityChecks(Exam exam, String email) {
        if (submissionRepository.existsByExamIdAndCandidateEmail(exam.getId(), email)) {
            throw new EligibilityException("ALREADY_STARTED_OR_COMPLETED");
        }

        Instant now = Instant.now();
        if (now.isAfter(exam.getEndTime())) {
            throw new EligibilityException("EXAM_ALREADY_ENDED");
        }

        Instant expectedFinishTime = now.plus(Duration.ofMinutes(exam.getDuration()));
        if (expectedFinishTime.isAfter(exam.getEndTime())) {
            throw new EligibilityException("NOT_ENOUGH_TIME_REMAINING");
        }
    }

    private Submission createSubmissionEntity(StartExamRequestDTO dto, Exam exam) {
        Submission submission = submissionMapper.toNewEntity(dto, exam);
        submission.setCandidateEmail(dto.getCandidateEmail());
        return submission;
    }

    private void updateCandidateStatus(String examId, String email, String status) {
        ExamCandidate candidate = examCandidateRepo.findByExamIdAndEmail(examId, email);
        if (candidate != null) {
            candidate.setStatus(status);
            examCandidateRepo.save(candidate);
        }
    }

    private ExamExtremaDTO buildExamExtremaDTO(Object[] extremes){
        String title = extremes[0] != null ?  (String) extremes[0] : "Invalid";
        Double score = extremes[1] != null ? (Double) extremes[1] : 0.0;
        return new ExamExtremaDTO(title,score);
    }

    private List<ExamExtremaDTO> buildExamExtremaDTOList(List<Object[]> extremes){
        if (extremes == null || extremes.isEmpty()) {
            return List.of();
        }
        return extremes.
                stream().
                map(this::buildExamExtremaDTO).
                toList();
    }

    private SubmissionsOverviewDTO buildSubmissionsOverviewDTO(String email) {
        SubmissionsOverviewDTO submissionsOverviewDTO = new SubmissionsOverviewDTO();

        Long totalPassed = submissionRepository.findPassedCount(email);
        Long totalAppeared = submissionRepository.findAppearedCount(email);
        Long totalFailed = Math.max(0, totalAppeared - totalPassed);

        submissionsOverviewDTO.
                setAverageScore(
                        submissionRepository.
                                findAverageScore(email)
                );
        submissionsOverviewDTO.
                setTotalExams(
                        examRepository.
                                publishedCount(email)
                );
        submissionsOverviewDTO.
                setHighestRecords(
                        buildExamExtremaDTOList(
                                submissionRepository.
                                        findHighestResults(email, 5)
                        )
                );
        submissionsOverviewDTO.
                setLowestRecords(
                        buildExamExtremaDTOList(
                                submissionRepository.
                                        findLowestResults(email, 5)
                        )
                );
        submissionsOverviewDTO.
                setCandidatesAppeared(
                        totalAppeared
                );
        submissionsOverviewDTO.
                setTotalPassed(
                        totalPassed
                );
        submissionsOverviewDTO.
                setTotalFailed(
                        totalFailed
                );
        return submissionsOverviewDTO;
    }

    private CandidateResultObj buildCandidateResultObj(Object[] object, String examId) {
        return CandidateResultObj.builder()
                .examTitle((String) object[0])
                .name((String) object[1])
                .email((String) object[2])
                .score((Double) object[3])
                .passed((boolean)  object[4])
                .examId(examId)
                .build();
    }
}
