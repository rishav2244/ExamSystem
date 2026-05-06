import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchExamContent, saveAnswer, finalizeExam, reportViolation } from '../api/api';
import { QuestionCard } from '../components/cardType/QuestionCard';
import { ExamHeader } from '../components/headerType/ExamHeader';
import { ProctoringManager } from '../components/managerType/ProctoringManager';
import { QuestionNavigation } from '../components/navType/QuestionNavigation';

export const ExamInterface = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { examId } = location.state || {};

    const [examData, setExamData] = useState(null);
    const [submissionId, setSubmissionId] = useState(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [violationCount, setViolationCount] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [isDisqualified, setIsDisqualified] = useState(false);

    const triggerViolation = useCallback(() => {
        if (isDisqualified || showWarning || !submissionId) return;
        setViolationCount(prev => {
            const newCount = prev + 1;
            reportViolation(submissionId).catch(console.error);
            if (newCount >= 3) { setIsDisqualified(true); return 3; }
            setShowWarning(true);
            return newCount;
        });
    }, [submissionId, isDisqualified, showWarning]);

    useEffect(() => {
        if (!examId) return navigate('/candidate/dashboard');

        const initializeInterface = async () => {
            try {
                const data = await fetchExamContent(examId);
                setExamData(data);
                setSubmissionId(data.submissionId);
                setViolationCount(data.violations);
                
                // Disqualify immediately if they resume with 3+ violations
                if (data.violations >= 3) setIsDisqualified(true);

                // 1. Map existing answers from the DTO into local state
                const prefilled = {};
                data.questions.forEach(q => {
                    const chosenOption = q.options.find(opt => opt.chosen === true);
                    if (chosenOption) {
                        prefilled[q.id] = chosenOption.id;
                    }
                });
                setSelectedOptions(prefilled);

                // 2. Calculate Timer
                if (data.startTime) {
                    // Resume Case: Calculate remaining time
                    const start = new Date(data.startTime).getTime();
                    const now = new Date().getTime();
                    const elapsedSec = Math.floor((now - start) / 1000);
                    const remaining = (data.duration * 60) - elapsedSec;
                    
                    // Also consider hard endTime
                    const hardEnd = new Date(data.endTime).getTime();
                    const portalRemaining = Math.floor((hardEnd - now) / 1000);
                    
                    const actualTime = Math.min(remaining, portalRemaining);
                    setTimeLeft(actualTime > 0 ? actualTime : 0);
                } else {
                    // Fresh Start Case
                    setTimeLeft(data.duration * 60);
                }

                document.documentElement.requestFullscreen().catch(console.error);
            } catch (err) {
                console.error("Initialization failed", err);
                navigate('/candidate/dashboard');
            }
        };

        initializeInterface();
    }, [examId, navigate]);

    useEffect(() => {
        if (timeLeft <= 0 && examData) return; // Only start timer once data is loaded

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleFinish();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, examData]);

    const handleOptionSelect = async (questionId, optionId) => {
        setSelectedOptions(prev => ({ ...prev, [questionId]: optionId }));
        try {
            // Only save if we have a submissionId (which we should after start)
            if (submissionId) await saveAnswer(submissionId, questionId, optionId);
        } catch (err) {
            console.error("Auto-save failed", err);
        }
    };

    const handleDismissWarning = () => {
        setShowWarning(false);
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    };

    const handleFinish = async () => {
        try {
            if (submissionId) await finalizeExam(submissionId);
            if (document.fullscreenElement) await document.exitFullscreen();
            navigate('/candidate/dashboard', { state: { ExamSubmitted: true } });
        } catch (error) {
            console.error("Submission failed", error);
        }
    };

    if (!examData) return <div className="loading">Initializing Secure Environment...</div>;

    return (
        <div className="exam-container"
            onContextMenu={(e) => { e.preventDefault(); triggerViolation(); }}
            onCopy={(e) => { e.preventDefault(); triggerViolation(); }}>

            <ProctoringManager
                violationCount={violationCount}
                isDisqualified={isDisqualified}
                showWarning={showWarning}
                onViolation={triggerViolation}
                onDismissWarning={handleDismissWarning}
                onFinalize={handleFinish}
                submissionId={submissionId}
            />
            
            <ExamHeader
                title={examData.title}
                timeLeft={timeLeft}
                violationCount={violationCount}
                onFinish={handleFinish}
                isDanger={timeLeft <= 300} // 5 minutes warning
            />

            <main className="exam-body">
                <QuestionNavigation
                    questions={examData.questions}
                    currentIdx={currentIdx}
                    selectedOptions={selectedOptions}
                    onNavClick={setCurrentIdx}
                />

                <section className="question-section">
                    <QuestionCard
                        question={examData.questions[currentIdx]}
                        index={currentIdx}
                        selectedOptionId={selectedOptions[examData.questions[currentIdx].id]}
                        onSelect={handleOptionSelect}
                    />
                    
                    <div className="navigation-controls">
                        <button
                            className="nav-btn prev-btn"
                            disabled={currentIdx === 0}
                            onClick={() => setCurrentIdx(p => p - 1)}
                        >
                            Previous
                        </button>
                        {currentIdx < examData.questions.length - 1 ? (
                            <button
                                className="nav-btn next-btn"
                                onClick={() => setCurrentIdx(p => p + 1)}
                            >
                                Next
                            </button>
                        ) : (
                            <button className="nav-btn finish-btn" onClick={handleFinish}>
                                Finish Exam
                            </button>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};