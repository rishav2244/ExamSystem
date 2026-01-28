import { useContext, useEffect, useState } from "react";
import { AuthenticationContext } from "../context/AuthenticationContext";
import { getCandidateDashboard, checkCandidateEligibility } from "../api";

export const Candidate = () => {
    const { email } = useContext(AuthenticationContext);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCandidateDashboard(email)
            .then((data) => {
                setExams(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [email]);

    const handleEligibilityCheck = async (examId) => {
        try {
            await checkCandidateEligibility(examId, email);
            alert("You are eligible to start this exam.");
        } catch (err) {
            alert(err.response?.data || "Not eligible to start exam");
        }
    };

    if (loading) {
        return <p className="loading-text">Loading your exams...</p>;
    }

    return (
        <div className="CandidateDashboard">
            <h2 className="dashboard-title">Candidate Dashboard</h2>

            {exams.length === 0 && (
                <p className="empty-text">No exams assigned.</p>
            )}

            <div className="candidate-exam-list">
                {exams.map((exam) => (
                    <div className="CandidateExamCard" key={exam.examId}>
                        <h3 className="exam-title">{exam.title}</h3>

                        <p className="exam-meta">
                            <b>Duration:</b> {exam.duration} mins
                        </p>
                        <p className="exam-meta">
                            <b>Start:</b> {exam.startTime}
                        </p>
                        <p className="exam-meta">
                            <b>End:</b> {exam.endTime}
                        </p>
                        <p className="exam-meta">
                            <b>Status:</b> {exam.candidateStatus}
                        </p>

                        <button
                            className="CandidateActionButton"
                            onClick={() => handleEligibilityCheck(exam.examId)}
                        >
                            Check Eligibility
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
