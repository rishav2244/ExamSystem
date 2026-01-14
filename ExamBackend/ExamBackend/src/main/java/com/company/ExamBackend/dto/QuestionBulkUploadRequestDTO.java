package com.company.ExamBackend.dto;

import java.util.List;

public class QuestionBulkUploadRequestDTO {
    private String examId;
    private List<QuestionDTO> questions;
}