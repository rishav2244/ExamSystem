package com.company.ExamBackend.exception;

import com.company.ExamBackend.dto.ErrorResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    //=========================================================================================================//
    //Not found cases
    @ExceptionHandler({
            ExamNotFoundException.class,
            EmailNotFoundException.class,
            UserNotFoundException.class,
            GroupNotFoundException.class
    })
    public ResponseEntity<ErrorResponseDTO> handleNotFoundException(Exception ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponseDTO(404, ex.getMessage()));
    }
    //=========================================================================================================//

    //=========================================================================================================//
    //Conflicts and duplicates
    @ExceptionHandler(EmailExistsException.class)
    public ResponseEntity<ErrorResponseDTO> handleEmailConflictException(EmailExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponseDTO(409, ex.getMessage()));
    }

    //Thrown when trying to create group of existing name.
    @ExceptionHandler(GroupAlreadyExistsException.class)
    public ResponseEntity<ErrorResponseDTO> handleGroupConflictException(EmailExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponseDTO(409, ex.getMessage()));
    }
    //=========================================================================================================//

    //=========================================================================================================//
    //Security business
    @ExceptionHandler(PasswordMismatchException.class)
    public ResponseEntity<ErrorResponseDTO> handleAuthException(PasswordMismatchException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponseDTO(401, ex.getMessage()));
    }
    //=========================================================================================================//

    //=========================================================================================================//
    //Problems with business logic

    //Made this earlier while using generic exceptions. Might not be required anymore?
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponseDTO> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponseDTO(400, ex.getMessage()));
    }

    //Thrown when doing something not allowed
    @ExceptionHandler(InvalidActionException.class)
    public ResponseEntity<ErrorResponseDTO> handleInvalidAction(InvalidActionException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponseDTO(403, ex.getMessage()));
    }

    //Thrown for eligibility check
    @ExceptionHandler(EligibilityException.class)
    public ResponseEntity<ErrorResponseDTO> handleEligibility(EligibilityException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponseDTO(400, ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> handleValidationExceptions(MethodArgumentNotValidException ex) {
        // Getting first error message we find
        String errorMessage = ex.getBindingResult()
                .getFieldErrors()
                .get(0)
                .getDefaultMessage();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponseDTO(400, errorMessage));
    }

    //=========================================================================================================//

    //=========================================================================================================//
    // Default response for runtime exceptions
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponseDTO> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponseDTO(400, ex.getMessage()));
    }
    //=========================================================================================================//

    //=========================================================================================================//
    //Internal server error
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGlobalException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponseDTO(500, "An unexpected error occurred."));
    }
    //=========================================================================================================//
}