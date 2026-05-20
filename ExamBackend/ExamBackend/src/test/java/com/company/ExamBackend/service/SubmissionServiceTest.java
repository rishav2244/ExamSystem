package com.company.ExamBackend.service;

import com.company.ExamBackend.exception.EligibilityException;
import com.company.ExamBackend.model.Exam;
import com.company.ExamBackend.model.Submission;
import com.company.ExamBackend.repository.ExamRepository;
import com.company.ExamBackend.repository.SubmissionRepository;
import com.company.ExamBackend.service.impl.SubmissionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SubmissionServiceTest {

    @Mock
    private SubmissionRepository submissionRepository;
    @Mock
    private ExamRepository examRepository;

    @InjectMocks
    private SubmissionServiceImpl submissionService;

    private Exam mockExam;
    private String email = "candidate@example.com";

    @BeforeEach
    void setUp() {
        mockExam = new Exam();
        mockExam.setId("exam-123");
        mockExam.setDuration(60); // 60 minutes
        // Set end time to 2 hours from now
        mockExam.setEndTime(Instant.now().plus(Duration.ofHours(2)));
        mockExam.setAllowResume(true);
    }

    @Test
    void checkEligibility_FreshStart_ShouldPass() {
        // Arrange: No existing submission
        when(submissionRepository.findByCandidateEmailAndExamId(email, mockExam.getId()))
                .thenReturn(Optional.empty());
        when(examRepository.findById(anyString())).thenReturn(Optional.of(mockExam));

        // Act & Assert: Should not throw any exception
        assertDoesNotThrow(() -> submissionService.checkEligibility(mockExam.getId(), email));
    }

    @Test
    void checkEligibility_NotEnoughTime_ShouldThrowException() {
        // Arrange: Exam ends in 10 mins, but duration is 60 mins
        mockExam.setEndTime(Instant.now().plus(Duration.ofMinutes(10)));
        when(examRepository.findById(anyString())).thenReturn(Optional.of(mockExam));
        when(submissionRepository.findByCandidateEmailAndExamId(email, mockExam.getId()))
                .thenReturn(Optional.empty());

        // Act & Assert
        EligibilityException ex = assertThrows(EligibilityException.class,
                () -> submissionService.checkEligibility(mockExam.getId(), email));
        assertEquals("NOT_ENOUGH_TIME_REMAINING_TO_START", ex.getMessage());
    }

    @Test
    void checkEligibility_ResumeInProgress_ShouldPass() {
        // Arrange: Submission exists and is IN_PROGRESS
        Submission sub = new Submission();
        sub.setStatus("IN_PROGRESS");

        when(examRepository.findById(anyString())).thenReturn(Optional.of(mockExam));
        when(submissionRepository.findByCandidateEmailAndExamId(email, mockExam.getId()))
                .thenReturn(Optional.of(sub));

        // Act & Assert
        assertDoesNotThrow(() -> submissionService.checkEligibility(mockExam.getId(), email));
    }

    @Test
    void checkEligibility_ResumeWhenNotAllowed_ShouldThrowException() {
        // Arrange: Exam has allowResume = false
        mockExam.setAllowResume(false);
        Submission sub = new Submission();
        sub.setStatus("IN_PROGRESS");

        when(examRepository.findById(anyString())).thenReturn(Optional.of(mockExam));
        when(submissionRepository.findByCandidateEmailAndExamId(email, mockExam.getId()))
                .thenReturn(Optional.of(sub));

        // Act & Assert
        EligibilityException ex = assertThrows(EligibilityException.class,
                () -> submissionService.checkEligibility(mockExam.getId(), email));
        assertEquals("RESUME_NOT_ALLOWED", ex.getMessage());
    }

    @Test
    void checkEligibility_AlreadySubmitted_ShouldThrowException() {
        // Arrange: Status is COMPLETED
        Submission sub = new Submission();
        sub.setStatus("COMPLETED");

        when(examRepository.findById(anyString())).thenReturn(Optional.of(mockExam));
        when(submissionRepository.findByCandidateEmailAndExamId(email, mockExam.getId()))
                .thenReturn(Optional.of(sub));

        // Act & Assert
        EligibilityException ex = assertThrows(EligibilityException.class,
                () -> submissionService.checkEligibility(mockExam.getId(), email));
        assertEquals("EXAM_ALREADY_SUBMITTED", ex.getMessage());
    }
}