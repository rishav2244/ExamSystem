import { useContext, useEffect, useState } from "react";
import { AuthenticationContext } from "../context/AuthenticationContext";
import { CandidateExamCard } from "../components/cardType/CandidateExamCard";
import { CandidateHeader } from "../components/headerType/CandidateHeader";
import { getCandidateDashboard, checkCandidateEligibility } from "../api/api";
import { useNavigate, useLocation } from "react-router-dom";
import { useNotification } from "../components/popupType/NotificationContext";

import styles from "./css/Candidate.module.css"

export const Candidate = () => {
    const { email, name } = useContext(AuthenticationContext);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [eligibilityData, setEligibilityData] = useState({});

    const navigate = useNavigate();
    const location = useLocation();
    const { showNotification } = useNotification();

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

    useEffect(() => {
        if (location.state?.ExamSubmitted) {
            showNotification("Exam submitted successfully.");
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [loading, location.state, showNotification, navigate]);

    const handleEligibilityCheck = async (examId) => {
        const cached = eligibilityData[examId];

        if (cached) {
            const route = cached.action === "RESUME" ? "/candidate/exam-setup" : "/candidate/exam-setup";
            navigate(route, {
                state: {
                    candidateExamId: examId,
                    submissionId: cached.submissionId,
                    action: cached.action,
                    email: email,
                    name: name
                }
            });
            return;
        }

        try {
            const result = await checkCandidateEligibility(examId);

            setEligibilityData((prev) => ({
                ...prev,
                [examId]: {
                    action: result.action,
                    submissionId: result.submissionId
                }
            }));

        } catch (err) {
            let errorText = "Not eligible to start exam";
            if (err.response?.data) {
                errorText = typeof err.response.data === 'string' 
                    ? err.response.data 
                    : (err.response.data.message || "Eligibility check failed");
            }
            showNotification(errorText, "error");
        }
    };

    if (loading) {
        return <p className={styles.LoadingText}>Loading your exams...</p>;
    }

    return (
        <div className={styles.CandidateDashboard}>
            <div className={styles.DashboardHeader}>
                <h2 className={styles.DashboardTitle}>Candidate Dashboard</h2>
                <button
                    className={styles.ViewResultsBtn}
                    onClick={() => navigate("/candidate/results")}
                >
                    View Results
                </button>
            </div>

            {exams.length === 0 && (
                <p className={styles.EmptyText}>No exams assigned.</p>
            )}

            <div className={styles.CandidateExamList}>
                {exams.map((exam) => (
                    <CandidateExamCard
                        key={exam.examId}
                        exam={exam}
                        onJoin={handleEligibilityCheck}
                        eligibilityAction={eligibilityData[exam.examId]?.action}
                    />
                ))}
            </div>
        </div>
    );
};