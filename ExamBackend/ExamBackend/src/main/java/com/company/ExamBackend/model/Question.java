package com.company.ExamBackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;


@Entity
@Getter
@Setter
@NoArgsConstructor
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam parentExam;

    @Column(nullable = false)
    private String text;

    @Column(nullable = false)
    private int marks;

    @Column(nullable = false)
    private String options;
}