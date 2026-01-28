package com.company.ExamBackend.mapper;

import com.company.ExamBackend.model.Answer;
import com.company.ExamBackend.model.Option;
import com.company.ExamBackend.model.Question;
import com.company.ExamBackend.model.Submission;

public class AnswerMapper {
    public static Answer toEntity(Submission submission, Question question, Option option) {
        Answer answer = new Answer();
        answer.setSubmission(submission);
        answer.setQuestion(question);
        answer.setSelectedOption(option);
        return answer;
    }
}