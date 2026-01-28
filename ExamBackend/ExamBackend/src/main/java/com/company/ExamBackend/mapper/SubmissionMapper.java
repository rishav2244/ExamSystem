package com.company.ExamBackend.mapper;

import com.company.ExamBackend.dto.StartExamRequestDTO;
import com.company.ExamBackend.model.Exam;
import com.company.ExamBackend.model.Submission;

import java.time.Instant;

public class SubmissionMapper {
    public static Submission toNewEntity(StartExamRequestDTO dto, Exam exam) {
        Submission submission = new Submission();
        submission.setExam(exam);
        submission.setCandidateName(dto.getCandidateName());
        submission.setCandidateEmail(dto.getCandidateEmail());
        submission.setLocation(dto.getLocation());
        submission.setCreatedAt(Instant.now());
        submission.setStatus("IN_PROGRESS");
        submission.setViolations(0);
        submission.setScore(0.0f);
        return submission;
    }
}