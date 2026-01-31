import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { startExam } from "../api/api";

export const CandidateExamSetup = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { candidateExamId, email, name } = location.state || {};

    const [cameraAllowed, setCameraAllowed] = useState(false);
    const [micAllowed, setMicAllowed] = useState(false);
    const [locationAllowed, setLocationAllowed] = useState(false);
    const [consent, setConsent] = useState(false);

    const allChecksPassed =
        cameraAllowed &&
        micAllowed &&
        locationAllowed &&
        consent;

    const runSystemChecks = () => {
        setCameraAllowed(false);
        setMicAllowed(false);
        setLocationAllowed(false);

        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then(() => {
                setCameraAllowed(true);
                setMicAllowed(true);
            })
            .catch(() => {
                setCameraAllowed(false);
                setMicAllowed(false);
            });

        navigator.geolocation.getCurrentPosition(
            () => setLocationAllowed(true),
            () => setLocationAllowed(false)
        );
    };

    useEffect(() => {
        runSystemChecks();
    }, []);

    const handleStartExam = async () => {
        try {
            const resp = await startExam(candidateExamId, name, email, "Browser-Client");

            navigate("/candidate/exam-room", {
                state: {
                    examId: candidateExamId,
                    submissionId: resp.submissionId,
                    duration: resp.duration
                }
            });
        } catch (err) {
            alert(err.response?.data || "Failed to start exam.");
        }
    };

    return (
        <div className="CandidateExamSetup">
            <h2>Exam Setup</h2>

            <p><b>Name:</b> {name}</p>
            <p><b>Email:</b> {email}</p>
            

            <hr />

            <p>Camera Access: {cameraAllowed ? "Allowed" : "Not Allowed "}</p>
            <p>Mic Access: {micAllowed ? "Allowed " : "Not Allowed "}</p>
            <p>Location Access: {locationAllowed ? "Allowed " : "Not Allowed "}</p>

            {(!cameraAllowed || !micAllowed || !locationAllowed) && (
                <button
                    className="RetryButton"
                    onClick={runSystemChecks}
                >
                    Retry System Check
                </button>
            )}

            <hr />

            <label>
                <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                />
                I agree to the exam rules and monitoring
            </label>

            <br /><br />

            <button
                disabled={!allChecksPassed}
                onClick={handleStartExam}
            >
                Start Exam
            </button>
        </div>
    );
};
