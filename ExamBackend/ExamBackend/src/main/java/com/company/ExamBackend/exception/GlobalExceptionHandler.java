package com.company.ExamBackend.exception;

import com.company.ExamBackend.dto.ErrorResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({ExamNotFoundException.class, EmailNotFoundException.class})
    public ResponseEntity<ErrorResponseDTO> handleNotFoundException(Exception ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponseDTO(404, ex.getMessage()));
    }

    @ExceptionHandler(EmailExistsException.class)
    public ResponseEntity<ErrorResponseDTO> handleEmailExistsException(EmailExistsException ex) {
        // 409 Conflict is the standard for resource duplication (like unique emails)
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponseDTO(409, ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGlobalException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponseDTO(500, ex.getMessage()));
    }
}