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
    const [eligibleExams, setEligibleExams] = useState({});

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

        if (eligibleExams[examId]) {
            navigate("/candidate/exam-setup", {
                state: {
                    candidateExamId: examId,
                    email: email,
                    name: name
                }
            });
            return;
        }

        try {
            await checkCandidateEligibility(examId, email);

            setEligibleExams((prev) => ({
                ...prev,
                [examId]: true
            }));

        } catch (err) {
            alert(err.response?.data || "Not eligible to start exam");
        }
    };


    if (loading) {
        return <p className={styles.LoadingText}>Loading your exams...</p>;
    }

    return (
        <div className={styles.CandidateOverall}>
            <CandidateHeader />
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
                            isEligible={eligibleExams[exam.examId]}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};