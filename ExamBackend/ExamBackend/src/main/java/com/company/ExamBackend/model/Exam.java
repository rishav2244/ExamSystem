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
public class Exam
{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private int duration;

    @Column(nullable = false)
    private Instant StartTime;

    @Column(nullable = false)
    private Instant EndTime;

    @Column(nullable = false)
    private String status;

    @ManyToOne
    @JoinColumn(name = "userId", nullable = false)
    private Users createdBy;
}
