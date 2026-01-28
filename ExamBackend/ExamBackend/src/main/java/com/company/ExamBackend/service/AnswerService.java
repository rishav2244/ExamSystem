package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.AnswerRequestDTO;

public interface AnswerService {
    public void saveOrUpdateAnswer(AnswerRequestDTO dto);
    public void finalizeSubmission(String submissionId);
}