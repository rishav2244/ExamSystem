import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { startExam } from "../api/api";

// Import the Rules component
import { ExamRules } from "../components/FYIType/ExamRules";
import styles from "./css/CandidateExamSetup.module.css";

export const CandidateExamSetup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const webcamRef = useRef(null);
    const captureIntervalRef = useRef(null);

    const { candidateExamId, email, name, action } = location.state || {};

    // Logic for multi-step flow
    const [currentStep, setCurrentStep] = useState(1); // 1: Rules, 2: System Check

    const [cameraAllowed, setCameraAllowed] = useState(null);
    const [micAllowed, setMicAllowed] = useState(null);
    const [locationAllowed, setLocationAllowed] = useState(null);
    const [consent, setConsent] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cameraCheckStarted, setCameraCheckStarted] = useState(false);
    const [showFixHint, setShowFixHint] = useState(false);

    // Trap user on page to prevent accidental navigation
    useEffect(() => {
        if (!candidateExamId || !email) {
            navigate("/candidate/dashboard", { replace: true });
            return;
        }

        const lockSetupHistory = () => {
            window.history.pushState(null, document.title, window.location.href);
        };

        window.history.pushState(null, document.title, window.location.href);
        window.addEventListener('popstate', lockSetupHistory);

        return () => window.removeEventListener('popstate', lockSetupHistory);
    }, [candidateExamId, email, navigate]);

    // Trigger system checks automatically when entering Step 2
    useEffect(() => {
        if (currentStep === 2 && candidateExamId && email) {
            runSystemChecks();
        }
        return () => {
            if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
        };
    }, [currentStep, candidateExamId, email]);

    const runSystemChecks = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setCameraAllowed(true);
            setMicAllowed(true);
            stream.getTracks().forEach(track => track.stop()); // Release hardware
            setShowFixHint(false);
        } catch (err) {
            setCameraAllowed(false);
            setMicAllowed(false);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setShowFixHint(true);
            }
        }

        navigator.geolocation.getCurrentPosition(
            () => setLocationAllowed(true),
            () => {
                setLocationAllowed(false);
                setShowFixHint(true);
            }
        );
    };

    const handleStartExam = async () => {
        setLoading(true);
        if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);

        try {
            if (action !== "RESUME") {
                await startExam(candidateExamId, name, email, "Browser-Client");
            }
            navigate("/candidate/exam-room", {
                replace: true,
                state: { examId: candidateExamId, resumed: action === "RESUME" }
            });
        } catch (err) {
            alert(err.response?.data || "Failed to initialize exam session.");
            navigate("/candidate/dashboard", { replace: true });
        } finally {
            setLoading(false);
        }
    };

    const allChecksPassed = cameraAllowed && micAllowed && locationAllowed && consent && cameraCheckStarted;

    if (!candidateExamId || !email) return null;

    return (
        <div className={styles.CandidateSetupContainer}>
            {currentStep === 1 ? (
                <ExamRules onAccept={() => setCurrentStep(2)} />
            ) : (
                <div className={styles.StepFadeIn}>
                    <h2 className={styles.SetupTitle}>System Integrity Check</h2>
                    
                    <div className={styles.IntegrityChecklist}>
                        <div className={styles.ChecklistRow}>
                            <span className={styles.ItemLabel}>Camera Access</span>
                            <span className={`${styles.StatusTag} ${cameraAllowed === true ? styles.Ready : cameraAllowed === false ? styles.Denied : styles.Pending}`}>
                                {cameraAllowed === true ? "Verified" : cameraAllowed === false ? "Denied" : "Checking..."}
                            </span>
                        </div>
                        <div className={styles.ChecklistRow}>
                            <span className={styles.ItemLabel}>Microphone Access</span>
                            <span className={`${styles.StatusTag} ${micAllowed === true ? styles.Ready : micAllowed === false ? styles.Denied : styles.Pending}`}>
                                {micAllowed === true ? "Verified" : micAllowed === false ? "Denied" : "Checking..."}
                            </span>
                        </div>
                        <div className={styles.ChecklistRow}>
                            <span className={styles.ItemLabel}>Location Services</span>
                            <span className={`${styles.StatusTag} ${locationAllowed === true ? styles.Ready : locationAllowed === false ? styles.Denied : styles.Pending}`}>
                                {locationAllowed === true ? "Verified" : locationAllowed === false ? "Denied" : "Checking..."}
                            </span>
                        </div>
                    </div>

                    {(cameraAllowed === false || micAllowed === false || locationAllowed === false) && (
                        <div className={styles.PermissionErrorBox}>
                            <p className={styles.ErrorText}>Essential permissions are missing.</p>
                            <button className={styles.RetryBtn} onClick={runSystemChecks}>Re-request Access</button>
                            {showFixHint && (
                                <div className={styles.FixHintContainer}>
                                    <h4>Quick Fix:</h4>
                                    <p>Click the 🔒 lock icon in the URL bar, enable permissions, and refresh or retry.</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className={styles.CameraVerification}>
                        {cameraAllowed && !showCamera && (
                            <button className={styles.VerificationTrigger} onClick={() => { setShowCamera(true); setCameraCheckStarted(true); }}>
                                Run Visual Camera Check
                            </button>
                        )}
                        {showCamera && (
                            <div className={styles.WebcamPreview}>
                                <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg" width={320} />
                            </div>
                        )}
                    </div>

                    <div className={styles.ConsentWrapper}>
                        <input type="checkbox" id="setup-consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                        <label htmlFor="setup-consent">I agree to the proctoring rules and monitoring.</label>
                    </div>

                    <div className={styles.ActionRow}>
                        <button className={styles.SecondaryBtn} onClick={() => setCurrentStep(1)}>Back to Rules</button>
                        <button 
                            className={styles.FinalStartButton} 
                            disabled={!allChecksPassed || loading} 
                            onClick={handleStartExam}
                        >
                            {loading ? "Processing..." : "Start Examination"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};