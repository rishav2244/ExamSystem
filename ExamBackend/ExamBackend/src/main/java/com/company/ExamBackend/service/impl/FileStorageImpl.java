package com.company.ExamBackend.service.impl;

import com.company.ExamBackend.service.FileStorage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageImpl implements FileStorage {
    @Value("${APP_UPLOAD_DIR}")
    private String uploadDir;

    @Override
    public String save(MultipartFile file) {
        try {
            Path root = Paths.get(uploadDir);
            if (!Files.exists(root)) {
                log.info("Creating upload directory at: {}", root.toAbsolutePath());
                Files.createDirectories(root);
            }

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path targetPath = root.resolve(filename);

            Files.copy(file.getInputStream(), targetPath);
            log.debug("File saved successfully to: {}", targetPath);

            return filename;
        } catch (IOException e) {
            log.error("Failed to store file: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("Could not store the file. Error: " + e.getMessage());
        }
    }

    @Override
    public void delete(String filename) {
        if (filename == null || filename.isBlank()) {
            log.error("Delete failed: Provided filename is null or blank");
            return;
        }

        try {
            Path root = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path filePath = root.resolve(filename).normalize();

            log.info("Attempting to delete file. Full calculated path: {}", filePath);

            if (Files.exists(filePath)) {
                boolean deleted = Files.deleteIfExists(filePath);
                log.info("File found. Deletion status for {}: {}", filename, deleted);
            } else {
                log.warn("File NOT found on disk at: {}. Check if APP_UPLOAD_DIR matches save location.", filePath);
            }
        } catch (IOException e) {
            log.error("IO Error while deleting file: {}. Reason: {}", filename, e.getMessage());
        }
    }
}