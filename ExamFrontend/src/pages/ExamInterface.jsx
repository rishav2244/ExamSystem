import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchExamContent, saveAnswer, finalizeExam, reportViolation } from '../api/api';

export const ExamInterface = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { examId, submissionId, duration } = location.state || {};

    const [examData, setExamData] = useState(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [timeLeft, setTimeLeft] = useState(duration * 60);
    
    const [violationCount, setViolationCount] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [isDisqualified, setIsDisqualified] = useState(false);

    const triggerViolation = useCallback(() => {
        if (isDisqualified || showWarning) return; // Don't stack violations while modal is open

        setViolationCount(prev => {
            const newCount = prev + 1;
            reportViolation(submissionId).catch(err => console.error("Violation sync failed", err));

            if (newCount >= 3) {
                setIsDisqualified(true);
                return 3;
            } else {
                setShowWarning(true);
                return newCount;
            }
        });
    }, [submissionId, isDisqualified, showWarning]);

    useEffect(() => {
        if (!examId || !submissionId) {
            navigate('/user');
            return;
        }

        // Initial Fullscreen
        document.documentElement.requestFullscreen().catch(e => console.error("Initial Fullscreen failed", e));
        fetchExamContent(examId).then(setExamData);

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

        const handleVisibility = () => { if (document.hidden) triggerViolation(); };
        const handleBlur = () => { triggerViolation(); }; 
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && !isDisqualified && !showWarning) {
                triggerViolation();
            }
        };
        
        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("blur", handleBlur);
        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            clearInterval(timer);
            document.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("blur", handleBlur);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, [examId, submissionId, triggerViolation, navigate, isDisqualified, showWarning]);

    const handleDismissWarning = () => {
        setShowWarning(false);
        // Force Fullscreen on user click
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(e => console.error(e));
        }
    };

    const handleOptionSelect = async (questionId, optionId) => {
        setSelectedOptions(prev => ({ ...prev, [questionId]: optionId }));
        try {
            await saveAnswer(submissionId, questionId, optionId);
        } catch (err) {
            console.error("Auto-save failed", err);
        }
    };

    const handleFinish = async () => {
        try {
            await finalizeExam(submissionId);
            if (document.fullscreenElement) document.exitFullscreen();
            navigate('/user');
        } catch (err) {
            console.error("Finalize failed", err);
            navigate('/user'); 
        }
    };

    if (!examData) return <div className="loading">Loading Exam...</div>;

    const currentQuestion = examData.questions[currentIdx];

    return (
        <div 
            className="exam-container"
            onContextMenu={(e) => { e.preventDefault(); triggerViolation(); }}
            onCopy={(e) => { e.preventDefault(); triggerViolation(); }}
        >
            {/* STRIKE WARNING MODAL */}
            {showWarning && !isDisqualified && (
                <div className="modal-backdrop violation-overlay">
                    <div className="modal-window" style={{height: 'auto', minHeight: '200px'}}>
                        <h2 className="warning-text">⚠️ VIOLATION DETECTED</h2>
                        <p>Strike <b>{violationCount} / 3</b> recorded.</p>
                        <p>You must stay in <b>Fullscreen Mode</b> and remain on this tab.</p>
                        <button className="form-submit" onClick={handleDismissWarning}>
                            Return to Fullscreen & Continue
                        </button>
                    </div>
                </div>
            )}

            {/* DISQUALIFIED MODAL */}
            {isDisqualified && (
                <div className="modal-backdrop violation-overlay">
                    <div className="modal-window" style={{height: 'auto', minHeight: '250px'}}>
                        <h2 className="warning-text">EXAM TERMINATED</h2>
                        <p>You have reached <b>3 violations</b>.</p>
                        <p>Your access has been revoked due to proctoring violations.</p>
                        <button className="DeleteExamButton" onClick={handleFinish}>
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            )}

            <header className="exam-header">
                <div className="exam-info">
                    <h1>{examData.title}</h1>
                    <div className="exam-stats">
                        <span className="timer">
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </span>
                        <span className={`strike-counter ${violationCount > 0 ? 'warning' : ''}`}>
                            Strikes: {violationCount} / 3
                        </span>
                    </div>
                </div>
                <button className="submit-btn" onClick={handleFinish}>Submit Exam</button>
            </header>

            <main className="exam-body">
                <aside className="question-nav">
                    <div className="nav-grid">
                        {examData.questions.map((q, index) => (
                            <button
                                key={q.id}
                                className={`nav-item ${currentIdx === index ? 'active' : ''} ${selectedOptions[q.id] ? 'answered' : ''}`}
                                onClick={() => setCurrentIdx(index)}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </aside>

                <section className="question-section">
                    <div className="question-card">
                        <span className="marks-badge">{currentQuestion.marks} Marks</span>
                        <h2>Question {currentIdx + 1}</h2>
                        <p className="question-text">{currentQuestion.text}</p>

                        <div className="options-list">
                            {currentQuestion.options.map((option) => (
                                <label key={option.id} className={`option-item ${selectedOptions[currentQuestion.id] === option.id ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name={currentQuestion.id}
                                        checked={selectedOptions[currentQuestion.id] === option.id}
                                        onChange={() => handleOptionSelect(currentQuestion.id, option.id)}
                                    />
                                    <span className="option-index">{option.optionIndex + 1}</span>
                                    {option.text}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="navigation-controls">
                        <button disabled={currentIdx === 0} onClick={() => setCurrentIdx(prev => prev - 1)}>Previous</button>
                        {currentIdx < examData.questions.length - 1 && (
                            <button className="next-btn" onClick={() => setCurrentIdx(prev => prev + 1)}>Next</button>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};