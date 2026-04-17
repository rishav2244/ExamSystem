package com.company.ExamBackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@EntityListeners(AuditingEntityListener.class)
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
    private String imagePath;

    @Column(nullable = false)
    private boolean violation;

    @Column(nullable = false)
    private String type;

    @CreatedDate
    @Column(
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    @Column(nullable = true)
    private Integer violationSlNo; //Wrapper class since it handles null which primitives can't.
}
