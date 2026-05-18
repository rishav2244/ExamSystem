import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { startExam } from "../api/api";

export const CandidateExamSetup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const webcamRef = useRef(null);
    const captureIntervalRef = useRef(null);

    // Pull action and examId from state (passed from Candidate.jsx)
    const { candidateExamId, submissionId, email, name, action } = location.state || {};

    const [cameraAllowed, setCameraAllowed] = useState(false);
    const [micAllowed, setMicAllowed] = useState(false);
    const [locationAllowed, setLocationAllowed] = useState(false);
    const [consent, setConsent] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cameraCheckStarted, setCameraCheckStarted] = useState(false);

    // ==========================================
    // STATE VALIDATION & BACK-BUTTON LOCKDOWN
    // ==========================================
    useEffect(() => {
        // Guard clause: If a user clicks "Back" after finishing an exam,
        // history.state will be empty or missing critical identifiers.
        if (!candidateExamId || !email) {
            navigate("/candidate/dashboard", { replace: true });
            return;
        }

        // Trap the user on this page so they can't casually press back/forward
        const lockSetupHistory = () => {
            window.history.pushState(null, document.title, window.location.href);
        };

        window.history.pushState(null, document.title, window.location.href);
        window.addEventListener('popstate', lockSetupHistory);

        return () => {
            window.removeEventListener('popstate', lockSetupHistory);
        };
    }, [candidateExamId, email, navigate]);
    // ==========================================

    const allChecksPassed =
        cameraAllowed &&
        micAllowed &&
        locationAllowed &&
        consent &&
        cameraCheckStarted;

    useEffect(() => {
        if (candidateExamId && email) {
            runSystemChecks();
        }
        return () => {
            if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
        };
    }, [candidateExamId, email]);

    const runSystemChecks = () => {
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

    const startCameraCheck = () => {
        setShowCamera(true);
        setCameraCheckStarted(true);
        captureIntervalRef.current = setInterval(() => {
            if (webcamRef.current) {
                webcamRef.current.getScreenshot();
            }
        }, 5000);
    };

    const handleStartExam = async () => {
        setLoading(true);

        if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);

        try {
            if (action === "RESUME") {
                // Using replace: true so the setup page is cleared from history
                navigate("/candidate/exam-room", {
                    replace: true,
                    state: {
                        examId: candidateExamId,
                        resumed: true
                    }
                });
            } else {
                const resp = await startExam(
                    candidateExamId,
                    name,
                    email,
                    "Browser-Client"
                );

                // Using replace: true so the setup page is cleared from history
                navigate("/candidate/exam-room", {
                    replace: true,
                    state: {
                        examId: candidateExamId,
                        resumed: false
                    }
                });
            }
        } catch (err) {
            alert(err.response?.data || "Failed to initialize exam session.");
            // Send them back to safe territory if backend rejects initialization
            navigate("/candidate/dashboard", { replace: true });
        } finally {
            setLoading(false);
        }
    };

    const systemItems = [
        { id: 'cam', label: "Camera Access", status: cameraAllowed },
        { id: 'mic', label: "Microphone Access", status: micAllowed },
        { id: 'loc', label: "Location Services", status: locationAllowed },
    ];

    // Render nothing if safety checks push the user away
    if (!candidateExamId || !email) return null;

    return (
        <div className="candidate-setup-container">
            <h2 className="setup-title">
                {action === "RESUME" ? "Resuming Examination" : "Exam Preparation"}
            </h2>

            <div className="candidate-details">
                <p><strong>Candidate:</strong> {name}</p>
                <p><strong>Email:</strong> {email}</p>
            </div>

            <div className="integrity-checklist">
                <h3>System Integrity Check</h3>
                {systemItems.map((item) => (
                    <div key={item.id} className="checklist-row">
                        <span className="item-label">{item.label}</span>
                        <div className="item-status-group">
                            <span className={`status-tag ${item.status ? "ready" : "required"}`}>
                                {item.status ? "Verified" : "Pending"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="camera-verification">
                {cameraAllowed && !showCamera && (
                    <button className="verification-trigger" onClick={startCameraCheck}>
                        Run Camera Check
                    </button>
                )}

                {showCamera && (
                    <div className="webcam-preview">
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/jpeg"
                            width={320}
                            videoConstraints={{ facingMode: "user" }}
                        />
                    </div>
                )}
            </div>

            <div className="consent-wrapper">
                <input
                    type="checkbox"
                    id="user-consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                />
                <label htmlFor="user-consent">
                    I confirm that I have read the rules and consent to monitoring.
                </label>
            </div>

            <button
                className="final-start-button"
                disabled={!allChecksPassed || loading}
                onClick={handleStartExam}
            >
                {loading ? "Processing..." : action === "RESUME" ? "Continue to Exam" : "Start Examination"}
            </button>
        </div>
    );
};