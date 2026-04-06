import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchExamContent, saveAnswer, finalizeExam, reportViolation } from '../api/api';
import { QuestionCard } from '../components/cardType/QuestionCard';
import { ExamHeader } from '../components/headerType/ExamHeader';
import { ProctoringManager } from '../components/managerType/ProctoringManager';
import { QuestionNavigation } from '../components/navType/QuestionNavigation';
import { useNotification } from '../components/popupType/NotificationContext';

export const ExamInterface = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { examId, submissionId, duration } = location.state || {};
    const auth = JSON.parse(sessionStorage.getItem("auth"));
    // const studentId = auth?.user?.id;
    const { showNotification } = useNotification();

    const [examData, setExamData] = useState(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [timeLeft, setTimeLeft] = useState(duration * 60);
    const [violationCount, setViolationCount] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [isDisqualified, setIsDisqualified] = useState(false);

    const triggerViolation = useCallback(() => {
        if (isDisqualified || showWarning) return;
        setViolationCount(prev => {
            const newCount = prev + 1;
            reportViolation(submissionId).catch(console.error);
            if (newCount >= 3) { setIsDisqualified(true); return 3; }
            setShowWarning(true);
            return newCount;
        });
    }, [submissionId, isDisqualified, showWarning]);

    useEffect(() => {
        if (!examId || !submissionId) return navigate('/user');
        document.documentElement.requestFullscreen().catch(console.error);
        fetchExamContent(examId).then(setExamData);
    }, [examId, submissionId, navigate]);

    useEffect(() => {
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
    }, []);

    const handleOptionSelect = async (questionId, optionId) => {
        setSelectedOptions(prev => ({ ...prev, [questionId]: optionId }));
        try {
            await saveAnswer(submissionId, questionId, optionId);
        } catch (err) {
            console.error("Auto-save failed", err);
        }
    };

    const handleClearOption = async (questionId) => {
        setSelectedOptions(prev => ({ ...prev, [questionId]: null }));

        try {
            await saveAnswer(submissionId, questionId, null);
        } catch (err) {
            console.error("Failed to clear answer", err);
        }
    };

    const handleDismissWarning = () => {
        setShowWarning(false);
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    };

    const handleFinish = async () => {
        try {
            await finalizeExam(submissionId);

            if (document.fullscreenElement) {
                await document.exitFullscreen();
            }

            navigate('/user');
        } catch (error) {
            console.error("Submission failed", error);
        }
    };

    if (!examData) return <div className="loading">Loading Exam...</div>;

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
                isDanger={timeLeft <= 30}
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
                        {/* <button disabled={currentIdx === 0} onClick={() => setCurrentIdx(p => p - 1)}>Previous</button> */}
                        <button
                            className="nav-btn prev-btn"
                            disabled={currentIdx === 0}
                            onClick={() => setCurrentIdx(p => p - 1)}
                        >
                            Previous
                        </button>
                        {currentIdx < examData.questions.length - 1 && (
                            <button
                                className="nav-btn next-btn"
                                onClick={() => setCurrentIdx(p => p + 1)}
                            >
                                Next
                            </button>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};