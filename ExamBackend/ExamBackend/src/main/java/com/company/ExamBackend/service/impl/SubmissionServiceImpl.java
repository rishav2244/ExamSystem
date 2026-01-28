package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.dto.StartExamRequestDTO;
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

@Service
@AllArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {
    private final SubmissionRepository submissionRepository;
    private final ExamRepository examRepository;
    private final ExamCandidateRepo examCandidateRepo;

    @Override
    public void checkEligibility(String examId, String email) {
        boolean alreadyExists = submissionRepository.existsByExamIdAndCandidateEmail(examId, email);

        if (alreadyExists) {
            throw new RuntimeException("ALREADY_STARTED_OR_COMPLETED");
        }
    }

    @Override
    @Transactional
    public String startExam(StartExamRequestDTO dto) {
        checkEligibility(dto.getExamId(), dto.getCandidateEmail());

        Exam exam = examRepository.findById(dto.getExamId())
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        Submission submission = SubmissionMapper.toNewEntity(dto, exam);
        submission.setStatus("IN_PROGRESS");
        submission.setCandidateEmail(dto.getCandidateEmail());

        ExamCandidate candidate = examCandidateRepo.findByExamIdAndEmail(dto.getExamId(), dto.getCandidateEmail());
        candidate.setStatus("ATTEMPTED");
        examCandidateRepo.save(candidate);

        return submissionRepository.save(submission).getId();
    }

    @Transactional
    public void reportViolation(String submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        submission.setViolations(submission.getViolations() + 1);
        submissionRepository.save(submission);
    }
}
