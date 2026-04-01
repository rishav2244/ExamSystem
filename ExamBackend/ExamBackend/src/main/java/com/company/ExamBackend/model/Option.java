package com.company.ExamBackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Option {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String text;

    @Column(nullable = false)
    private boolean isCorrect = false;

    @Column(nullable = false)
    private int optionIndex;

//    Fetch Type is lazy since we usually fetch Option from Question and note vice versa.
//    When we do fetch specific options, we usually do it to check if specific answer is correct or not.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;
}