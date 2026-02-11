package com.company.ExamBackend.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorage {
    String save(MultipartFile file);
    void delete(String filename);
}
