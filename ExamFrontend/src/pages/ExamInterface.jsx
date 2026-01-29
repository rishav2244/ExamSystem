import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchExamContent, saveAnswer, finalizeExam, reportViolation } from '../api/api';

export const ExamInterface = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { examId, submissionId, duration } = location.state || {};

    const [examData, setExamData] = useState(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState({}); // {questionId: optionId}
    const [timeLeft, setTimeLeft] = useState(duration * 60);

    // 1. Initialize Exam
    useEffect(() => {
        if (!examId || !submissionId) {
            navigate('/user');
            return;
        }

        document.documentElement.requestFullscreen().catch(e => console.error("Fullscreen failed", e));

        fetchExamContent(examId).then(data => {
            setExamData(data);
        });

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleFinish();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Violation Detection (Tab switching)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                reportViolation(submissionId);
                alert("Violation Recorded: You left the exam tab.");
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            clearInterval(timer);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    const handleOptionSelect = async (questionId, optionId) => {
        setSelectedOptions(prev => ({ ...prev, [questionId]: optionId }));
        try {
            await saveAnswer(submissionId, questionId, optionId);
        } catch (err) {
            console.error("Failed to auto-save answer", err);
        }
    };

    const handleFinish = async () => {
        try {
            await finalizeExam(submissionId);
            if (document.fullscreenElement) document.exitFullscreen();
            navigate('/user');
        } catch (err) {
            console.error("Submission failed", err);
        }
    };

    if (!examData) return <div className="loading">Loading Exam...</div>;

    const currentQuestion = examData.questions[currentIdx];

    return (
        <div className="exam-container">
            <header className="exam-header">
                <div className="exam-info">
                    {/* Using 'title' from CandidateExamDTO */}
                    <h1>{examData.title}</h1>
                    <span className="timer">
                        Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                </div>
                <button className="submit-btn" onClick={handleFinish}>Finalize</button>
            </header>

            <main className="exam-body">
                <aside className="question-nav">
                    <div className="nav-grid">
                        {examData.questions.map((q, index) => (
                            <button
                                key={q.id} // CandidateQuestionDTO has 'id'
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
                        {/* Using 'marks' from CandidateQuestionDTO */}
                        <span className="marks-badge">{currentQuestion.marks} Marks</span>
                        <h2>Question {currentIdx + 1}</h2>
                        {/* Using 'text' from CandidateQuestionDTO */}
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
                                    {/* Using 'optionIndex' and 'text' from CandidateOptionDTO */}
                                    <span className="option-index">{option.optionIndex + 1}</span>
                                    {option.text}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="navigation-controls">
                        <button disabled={currentIdx === 0} onClick={() => setCurrentIdx(prev => prev - 1)}>Previous</button>
                        {currentIdx < examData.questions.length - 1 ? (
                            <button className="next-btn" onClick={() => setCurrentIdx(prev => prev + 1)}>Next Question</button>
                        ) : (
                            <button className="finish-btn" onClick={handleFinish}>Finish Exam</button>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};