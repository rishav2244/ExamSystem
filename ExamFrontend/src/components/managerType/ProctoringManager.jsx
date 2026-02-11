import React, { useEffect, useRef, useCallback } from 'react';
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
    const lastProcessedViolation = useRef(0);
    const snapshotPeriod = 10000;

    const captureAndUpload = useCallback(async (isViolationParam = false) => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                try {
                    const blob = await fetch(imageSrc).then(res => res.blob());
                    await uploadSnapshot(submissionId, 
                        studentId, 
                        blob, 
                        "WEBCAM", 
                        isViolationParam);
                } catch (error) {
                    console.error("Failed to capture/upload snapshot", error);
                }
            }
        }
    }, [submissionId, studentId]);

    useEffect(() => {
        const interval = setInterval(() => {
            captureAndUpload(false);
        }, snapshotPeriod);
        return () => clearInterval(interval);
    }, [captureAndUpload]);

    useEffect(() => {
        if (violationCount > lastProcessedViolation.current) {
            captureAndUpload(true);
            lastProcessedViolation.current = violationCount;
        }
    }, [violationCount, captureAndUpload]);

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
                    top: '-1000px',
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