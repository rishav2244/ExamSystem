import React, { useEffect, useRef, useCallback } from 'react';
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
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const lastProcessedViolation = useRef(0);
    const snapshotPeriod = 10000;
 
    useEffect(() => {
        async function setupCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480 },
                    audio: false
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing webcam:", err);
            }
        }
        setupCamera();
 
        
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);
 
    
    const captureAndUpload = useCallback(async (isViolationParam = false) => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
 
        if (video && canvas && video.readyState === 4) { 
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
 
            
            canvas.toBlob(async (blob) => {
                if (blob) {
                    try {
                        await uploadSnapshot(
                            submissionId,
                            studentId,
                            blob,
                            "WEBCAM",
                            isViolationParam
                        );
                    } catch (error) {
                        console.error("Failed to upload snapshot", error);
                    }
                }
            }, 'image/jpeg', 0.8); 
        }
    }, [submissionId, studentId]);
 
   
    useEffect(() => {
        const interval = setInterval(() => captureAndUpload(false), snapshotPeriod);
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
            
            <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ display: 'none' }}
            />
            <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
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