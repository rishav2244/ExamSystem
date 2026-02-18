import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { uploadSnapshot } from '../api/api';

const ProctoringGuard = ({ children }) => {
    const location = useLocation();
    const streamRef = useRef(null);
    const submissionId = location.state?.submissionId;

    useEffect(() => {
        if (!submissionId) return;

        const startProctoring = async () => {
            try {
                
                if (!streamRef.current) {
                    streamRef.current = await navigator.mediaDevices.getDisplayMedia({
                        video: true
                    });
                }

                const interval = setInterval(() => {
                    takeSnapshot();
                }, 60000); 

                return () => {
                    clearInterval(interval);
                    if (streamRef.current) {
                        streamRef.current.getTracks().forEach(t => t.stop());
                    }
                };
            } catch (e) { console.error(e); }
        };

        const takeSnapshot = () => {
            if (!streamRef.current) return;
            const video = document.createElement('video');
            video.srcObject = streamRef.current;
            video.onloadedmetadata = () => {
                video.play();
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);
                canvas.toBlob(blob => {
                    uploadSnapshot(submissionId, null, blob, "SCREENSHOT", false);
                }, 'image/jpeg');
            };
        };

        startProctoring();
    }, [submissionId]);

    return children;
};

export default ProctoringGuard;