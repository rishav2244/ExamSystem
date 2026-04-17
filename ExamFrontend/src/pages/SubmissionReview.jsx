import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getSubmissionDetails } from "../api/api";

export const SubmissionReview = () => {
    const { submissionId } = useParams();

    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const passedFromState = location.state?.sub?.passed;
    const isPassed = details?.passed ?? passedFromState;

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

    const getMaxMarks = () => {
        if (!details || !details.questions) return 0;
        return details.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
    };


    if (loading) {
        return <p className="page-loading">Loading submission...</p>;
    }

    if (error) {
        return <p className="page-error">{error}</p>;
    }

    const maxMarks = getMaxMarks();

    return (
        <div className="submission-review-page">
            <h2>Submission Review</h2>

            <div className="review-actions">
                <button
                    className="view-snapshots-btn"
                    onClick={() => navigate(`/admin/submissions/${submissionId}/snapshots`)}
                >
                    View Proctoring Snapshots
                </button>
            </div>

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

                <div>
                    <span className="summary-label">Final Score</span>
                    <span className={isPassed ? "score-pass" : "score-fail"}>
                        {details.totalScore} / {maxMarks}
                    </span>
                </div>

                <div className={`result-banner ${isPassed ? "banner-pass" : "banner-fail"}`}>
                    {isPassed ? "PASSED" : "FAILED"}
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
