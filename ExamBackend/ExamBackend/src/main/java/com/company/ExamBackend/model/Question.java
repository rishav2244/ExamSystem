package com.company.ExamBackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Getter
@Setter
@NoArgsConstructor
public class Question
{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "examId", nullable = false)
    private Exam parentExam;

    @Column(nullable = false)
    private String text;

    @Lob
    @Column(nullable = false)
    private String options;

    @Column(nullable = false)
    private String correctOption;

    @Column(nullable = false)
    private int marks;
}
