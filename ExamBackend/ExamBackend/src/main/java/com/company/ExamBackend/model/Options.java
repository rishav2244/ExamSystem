package com.company.ExamBackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(
        name = "question_option",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"question_id", "optionIndex"}
                )
        }
)
public class Options {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name="optionIndex" , nullable = false)
    private String optionIndex;

    @Column(nullable = false)
    private String text;

    @Column(nullable = false)
    private boolean correct;
}
