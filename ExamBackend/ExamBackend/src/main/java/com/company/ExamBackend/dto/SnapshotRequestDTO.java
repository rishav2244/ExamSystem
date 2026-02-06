package com.company.ExamBackend.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class SnapshotRequestDTO {
    private String submissionId;
    private String studentId;
    private MultipartFile image;
}