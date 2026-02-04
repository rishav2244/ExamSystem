import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSubmissionDetails } from "../api/api";

export const SubmissionReview = () => {
    const { submissionId } = useParams();

    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getSubmissionDetails(submissionId)
            .then(setDetails)
            .catch(() => setError("Failed to load submission details"))
            .finally(() => setLoading(false));
    }, [submissionId]);

    useEffect(() => {
        if (details) {
            console.log(details.questions[0]);
        }
    }, [details]);


    const getQuestionStatus = (q) => {
        if (!q.selectedOptionId) return "unanswered";
        return q.correct ? "correct" : "wrong";
    };


    if (loading) {
        return <p className="page-loading">Loading submission...</p>;
    }

    if (error) {
        return <p className="page-error">{error}</p>;
    }

    return (
        <div className="submission-review-page">
            <h2>Submission Review</h2>

            <div className="submission-summary">
                <div>
                    <span className="summary-label">Candidate</span>
                    <span>{details.candidateName}</span>
                </div>

                <div>
                    <span className="summary-label">Total Score</span>
                    <span>{details.totalScore}</span>
                </div>

                <div>
                    <span className="summary-label">Questions</span>
                    <span>{details.questions.length}</span>
                </div>
            </div>

            <div className="question-review-list">
                {details.questions.map((q, index) => {
                    const status = getQuestionStatus(q);

                    return (
                        <div key={q.questionId} className={`question-card ${status}`}>
                            <div className="question-header">
                                <h4>
                                    Q{index + 1}. {q.questionText}
                                </h4>

                                <span className={`question-status ${status}`}>
                                    {status === "correct" && "Correct"}
                                    {status === "wrong" && "Wrong"}
                                    {status === "unanswered" && "Unanswered"}
                                </span>
                            </div>

                            <div className="question-marks">
                                Marks: {q.marks}
                            </div>

                            <ul className="options-list">
                                {q.options.map(opt => {
                                    const isSelected = opt.id === q.selectedOptionId;
                                    const correct = opt.correct;

                                    let optionClass = "option-item";

                                    if (isSelected && correct) {
                                        optionClass += " selected-correct-option";
                                    } else if (isSelected && !correct) {
                                        optionClass += " selected-wrong-option";
                                    } else if (correct) {
                                        optionClass += " correct-option";
                                    }


                                    return (
                                        <li key={opt.id} className={optionClass}>
                                            <span className="option-index">
                                                {String.fromCharCode(65 + opt.optionIndex)}.
                                            </span>
                                            <span>{opt.text}</span>

                                            {isSelected && correct && (
                                                <span className="option-tag correct-tag">Selected & Correct</span>
                                            )}

                                            {isSelected && !correct && (
                                                <span className="option-tag selected-tag">Selected (Wrong)</span>
                                            )}

                                            {!isSelected && correct && (
                                                <span className="option-tag correct-tag">Correct Answer</span>
                                            )}

                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}
            </div>

        </div>
    );
};
