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
public class Snapshot
{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "submissionId", nullable = false)
    private Submission submission;

    @Column(nullable = false)
    private String studentId;

    @Lob
    @Column(nullable = false)
    private String image;

    @Column(nullable = false)
    private Instant createdAt;
}
