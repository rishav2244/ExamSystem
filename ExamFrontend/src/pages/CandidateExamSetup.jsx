import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { startExam } from "../api/api";

export const CandidateExamSetup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const webcamRef = useRef(null);
    const captureIntervalRef = useRef(null);

    const { candidateExamId, email, name } = location.state || {};

    const [cameraAllowed, setCameraAllowed] = useState(false);
    const [micAllowed, setMicAllowed] = useState(false);
    const [locationAllowed, setLocationAllowed] = useState(false);
    const [consent, setConsent] = useState(false);

    const [showCamera, setShowCamera] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cameraCheckStarted, setCameraCheckStarted] = useState(false);

    
    const allChecksPassed =
        cameraAllowed &&
        micAllowed &&
        locationAllowed &&
        consent &&
        cameraCheckStarted;

    useEffect(() => {
        runSystemChecks();

        return () => {
            if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
        };
    }, []);

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
        try {
            if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);

            const resp = await startExam(
                candidateExamId,
                name,
                email,
                "Browser-Client"
            );

            navigate("/candidate/exam-room", {
                state: {
                    examId: candidateExamId,
                    submissionId: resp.submissionId,
                    duration: resp.duration
                }
            });
        } catch (err) {
            alert(err.response?.data || "Failed to start exam.");
        } finally {
            setLoading(false);
        }
    };

    
    const systemItems = [
        { id: 'cam', label: "Camera Access", status: cameraAllowed },
        { id: 'mic', label: "Microphone Access", status: micAllowed },
        { id: 'loc', label: "Location Services", status: locationAllowed },
    ];

    return (
        <div className="candidate-setup-container">
            <h2 className="setup-title">Exam Preparation</h2>

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
                {loading ? "Processing..." : "Start Examination"}
            </button>
        </div>
    );
};