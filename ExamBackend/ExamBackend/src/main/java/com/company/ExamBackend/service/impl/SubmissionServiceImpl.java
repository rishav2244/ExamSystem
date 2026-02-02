package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.dto.StartExamRequestDTO;
import com.company.ExamBackend.dto.StartExamResponseDTO;
import com.company.ExamBackend.dto.SubmissionResponseDTO;
import com.company.ExamBackend.mapper.SubmissionMapper;
import com.company.ExamBackend.model.Exam;
import com.company.ExamBackend.model.ExamCandidate;
import com.company.ExamBackend.model.Submission;
import com.company.ExamBackend.repository.ExamCandidateRepo;
import com.company.ExamBackend.repository.ExamRepository;
import com.company.ExamBackend.repository.SubmissionRepository;
import com.company.ExamBackend.service.SubmissionService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
@AllArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {
    private final SubmissionRepository submissionRepository;
    private final ExamRepository examRepository;
    private final ExamCandidateRepo examCandidateRepo;

    //Check eligibility has two purposes.
    //First purpose is to not let candidate just log off and a come back to an unsubmitted exam, then continue it.
    //While this is already covered in getCandidateDashboard(String email) method, we wish to keep it for now.
    //Second purpose is to prevent candidate from logging into an exam that has already ended.
    //For example, candidate enters dashboard and waits until end time of exam. Then he tries to log into it
    //since the exam is already listed. In that case, candidate should not be able to do so.
    //We will also have a refinement where candidate tries to enter an exam with not enough duration left,
    //following which he'll fail rejection again.
    @Override
    public void checkEligibility(String examId, String email) {
        boolean alreadyExists = submissionRepository.existsByExamIdAndCandidateEmail(examId, email);

        if (alreadyExists) {
            throw new RuntimeException("ALREADY_STARTED_OR_COMPLETED");
        }

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("EXAM_NOT_FOUND"));

        Instant now = Instant.now();
        boolean isTooLate = now.isAfter(exam.getEndTime());

        if (isTooLate) {
            throw new RuntimeException("EXAM_ALREADY_ENDED");
        }

        Instant expectedFinishTime = now.plus(Duration.ofMinutes(exam.getDuration()));

        if (expectedFinishTime.isAfter(exam.getEndTime())) {
            throw new RuntimeException("NOT_ENOUGH_TIME_REMAINING");
        }
    }

    @Override
    @Transactional
    public StartExamResponseDTO startExam(StartExamRequestDTO dto) {
        checkEligibility(dto.getExamId(), dto.getCandidateEmail());

        Exam exam = examRepository.findById(dto.getExamId())
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        Submission submission = SubmissionMapper.toNewEntity(dto, exam);
        submission.setStatus("IN_PROGRESS");
        submission.setCandidateEmail(dto.getCandidateEmail());

        ExamCandidate candidate = examCandidateRepo.findByExamIdAndEmail(dto.getExamId(), dto.getCandidateEmail());
        candidate.setStatus("ATTEMPTED");
        examCandidateRepo.save(candidate);

        String savedId = submissionRepository.save(submission).getId();
        return new StartExamResponseDTO(savedId, exam.getDuration());
    }

    @Transactional
    public void reportViolation(String submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        submission.setViolations(submission.getViolations() + 1);
        submissionRepository.save(submission);
    }

    @Override
    public List<SubmissionResponseDTO> getSubmissionsByExam(String examId) {
        List<Submission> submissions = submissionRepository.findByExamId(examId);
        return SubmissionMapper.toDTOList(submissions);
    }
}
