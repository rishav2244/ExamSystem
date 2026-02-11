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
    const [cameraCheckStarted, setCameraCheckStarted] = useState(false);

    const allChecksPassed =
        cameraAllowed &&
        micAllowed &&
        locationAllowed &&
        consent &&
        cameraCheckStarted;

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

    const captureImage = () => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            console.log("Camera snapshot taken (not saved)", imageSrc);
        }
    };

    const startCameraCheck = () => {
        setShowCamera(true);
        setCameraCheckStarted(true);

        captureIntervalRef.current = setInterval(() => {
            captureImage();
        }, 3000);
    };

    const stopCameraCheck = () => {
        clearInterval(captureIntervalRef.current);
    };

    const handleStartExam = async () => {
        try {
            stopCameraCheck();

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
        }
    };


    return (
        <div className="CandidateExamSetup">
            <h2>Exam Setup</h2>

            <p><b>Name:</b> {name}</p>
            <p><b>Email:</b> {email}</p>

            <hr />

            <p>Camera Access: {cameraAllowed ? "Allowed" : "Not Allowed"}</p>
            <p>Mic Access: {micAllowed ? "Allowed" : "Not Allowed"}</p>
            <p>Location Access: {locationAllowed ? "Allowed" : "Not Allowed"}</p>

            {(!cameraAllowed || !micAllowed || !locationAllowed) && (
                <button onClick={runSystemChecks}>
                    Retry System Check
                </button>
            )}

            <hr />

            {cameraAllowed && (
                <>
                    {!showCamera && (
                        <button onClick={startCameraCheck}>
                            OK – Start Camera Check
                        </button>
                    )}

                    {showCamera && (
                        <>
                            <Webcam
                                ref={webcamRef}
                                audio={false}
                                screenshotFormat="image/jpeg"
                                width={300}
                                videoConstraints={{
                                    facingMode: "user"
                                }}
                            />
                            <p>Camera is active and capturing images</p>
                        </>
                    )}
                </>
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
