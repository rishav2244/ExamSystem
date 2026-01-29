import React, { useEffect } from 'react';
import { ViolationOverlay } from '../FYIType/ViolationOverlay';

export const ProctoringManager = ({ 
    violationCount, 
    isDisqualified, 
    showWarning, 
    onViolation, 
    onDismissWarning, 
    onFinalize 
}) => {
    
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

    if (!showWarning && !isDisqualified) return null;

    return (
        <ViolationOverlay 
            count={violationCount} 
            isDisqualified={isDisqualified} 
            onDismiss={onDismissWarning} 
            onFinalize={onFinalize} 
        />
    );
};