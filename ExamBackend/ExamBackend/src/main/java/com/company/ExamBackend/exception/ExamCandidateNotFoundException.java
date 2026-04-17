package com.company.ExamBackend.exception;

public class ExamCandidateNotFoundException extends RuntimeException {
    public ExamCandidateNotFoundException(String message) {
        super(message);
    }
}
