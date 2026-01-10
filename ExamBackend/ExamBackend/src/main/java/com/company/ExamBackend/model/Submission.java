package com.company.ExamBackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Submission
{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name="examId", nullable = false)
    private Exam exam;

    @Column(nullable = false)
    private String candidateName;

    @Column(nullable = false)
    private String candidateEmail;

    @Column(nullable = false)
    private Float score;

    @Column(nullable = false)
    private int timeTaken;

    @Column(nullable = false)
    private Instant submittedAt;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private int violations;

    @Lob
    @Column(nullable = false)
    private String answers;
}
