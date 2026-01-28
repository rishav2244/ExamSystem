import { useContext, useEffect, useState } from "react";
import { AuthenticationContext } from "../context/AuthenticationContext";
import { CandidateExamCard } from "../components/cardType/CandidateExamCard";
import { CandidateHeader } from "../components/headerType/CandidateHeader";
import { getCandidateDashboard, checkCandidateEligibility } from "../api/api";

export const Candidate = () => {
    const { email } = useContext(AuthenticationContext);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [eligibleExams, setEligibleExams] = useState({});


    useEffect(() => {
        if (email) {
            getCandidateDashboard(email)
                .then((data) => {
                    setExams(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [email]);

    const handleEligibilityCheck = async (examId) => {
        try {
            await checkCandidateEligibility(examId, email);

            // mark this exam as eligible
            setEligibleExams((prev) => ({
                ...prev,
                [examId]: true
            }));

        } catch (err) {
            alert(err.response?.data || "Not eligible to start exam");
        }
    };


    if (loading) {
        return <p className="loading-text">Loading your exams...</p>;
    }

    return (
        <div className="AdminOverall">
            <CandidateHeader />

            <div className="CandidateDashboard">
                <h2 className="dashboard-title">Candidate Dashboard</h2>

                {exams.length === 0 && (
                    <p className="empty-text">No exams assigned.</p>
                )}

                <div className="candidate-exam-list">
                    {exams.map((exam) => (
                        <CandidateExamCard
                            key={exam.examId}
                            exam={exam}
                            onJoin={handleEligibilityCheck}
                            isEligible={eligibleExams[exam.examId]}
                        />
                    ))}

                </div>
            </div>
        </div>
    );
};