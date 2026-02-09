// import React, { useEffect, useRef, useCallback } from 'react';
// import Webcam from "react-webcam";
// import { uploadSnapshot } from '../../api/api'
// import { ViolationOverlay } from '../FYIType/ViolationOverlay';

// export const ProctoringManager = ({
//     submissionId,
//     studentId,
//     violationCount,
//     isDisqualified,
//     showWarning,
//     onViolation,
//     onDismissWarning,
//     onFinalize
// }) => {

//     const webcamRef = useRef(null);
//     const snapshotInterval = process.env.REACT_APP_SNAPSHOT_PERIOD || 10000; // Default 10s
//     const captureAndUpload = useCallback(async () => {
//         if (webcamRef.current) {
//             const imageSrc = webcamRef.current.getScreenshot();
//             if (imageSrc) {
//                 const blob = await fetch(imageSrc).then(res => res.blob());
//                 uploadSnapshot(submissionId, studentId, blob);
//             }
//         }
//     }, [submissionId, studentId]);

//     useEffect(() => {
//         const interval = setInterval(() => {
//             captureAndUpload();
//         }, snapshotInterval);

//         return () => clearInterval(interval);
//     }, [captureAndUpload, snapshotInterval]);

//     useEffect(() => {
//         if (violationCount > 0) {
//             captureAndUpload();
//         }
//     }, [violationCount, captureAndUpload]);

//     useEffect(() => {
//         const handleVisibility = () => document.hidden && onViolation();
//         const handleBlur = () => onViolation();
//         const handleFS = () => !document.fullscreenElement && !isDisqualified && !showWarning && onViolation();

//         document.addEventListener("visibilitychange", handleVisibility);
//         window.addEventListener("blur", handleBlur);
//         document.addEventListener("fullscreenchange", handleFS);

//         return () => {
//             document.removeEventListener("visibilitychange", handleVisibility);
//             window.removeEventListener("blur", handleBlur);
//             document.removeEventListener("fullscreenchange", handleFS);
//         };
//     }, [onViolation, isDisqualified, showWarning]);

//     if (!showWarning && !isDisqualified) return null;

//     return (
//         <>
//             <Webcam
//                 audio={false}
//                 ref={webcamRef}
//                 screenshotFormat="image/jpeg"
//                 videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
//                 style={{ opacity: 0, position: 'absolute', pointerEvents: 'none' }}
//             />

//             {(showWarning || isDisqualified) && (
//                 <ViolationOverlay
//                     count={violationCount}
//                     isDisqualified={isDisqualified}
//                     onDismiss={onDismissWarning}
//                     onFinalize={onFinalize}
//                 />
//             )}
//         </>
//     );
// };

import React, { useEffect, useRef, useCallback } from 'react'; // Added useRef, useCallback
import Webcam from "react-webcam";
import { uploadSnapshot } from '../../api/api';
import { ViolationOverlay } from '../FYIType/ViolationOverlay';

export const ProctoringManager = ({
    submissionId,
    studentId,
    violationCount,
    isDisqualified,
    showWarning,
    onViolation,
    onDismissWarning,
    onFinalize
}) => {
    const webcamRef = useRef(null);
    // Ensure the period is parsed as an integer
    const snapshotPeriod = 10000;

    const captureAndUpload = useCallback(async () => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                try {
                    const blob = await fetch(imageSrc).then(res => res.blob());
                    await uploadSnapshot(submissionId, studentId, blob);
                } catch (error) {
                    console.error("Failed to capture/upload snapshot", error);
                }
            }
        }
    }, [submissionId, studentId]);

    // Periodic Snapshot
    useEffect(() => {
        const interval = setInterval(() => {
            captureAndUpload();
        }, snapshotPeriod);
        return () => clearInterval(interval);
    }, [captureAndUpload, snapshotPeriod]);

    // Violation Snapshot
    useEffect(() => {
        if (violationCount > 0) {
            captureAndUpload();
        }
    }, [violationCount, captureAndUpload]);

    // Proctoring Listeners
    useEffect(() => {
        const handleVisibility = () => document.hidden && onViolation();
        const handleBlur = () => onViolation();
        const handleFS = () => !document.fullscreenElement && !isDisqualified && !showWarning && onViolation();

        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("blur", handleBlur);
        document.addEventListener("fullscreenchange", handleFS);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("blur", handleBlur);
            document.removeEventListener("fullscreenchange", handleFS);
        };
    }, [onViolation, isDisqualified, showWarning]);

    return (
        <>
            {/* Webcam MUST always render to work in background */}
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
                style={{ 
                    opacity: 0, 
                    position: 'absolute', 
                    top: '-1000px', // Move it off-screen safely
                    pointerEvents: 'none' 
                }}
            />

            {(showWarning || isDisqualified) && (
                <ViolationOverlay
                    count={violationCount}
                    isDisqualified={isDisqualified}
                    onDismiss={onDismissWarning}
                    onFinalize={onFinalize}
                />
            )}
        </>
    );
};