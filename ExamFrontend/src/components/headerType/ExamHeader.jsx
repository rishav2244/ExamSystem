export const ExamHeader = ({ title, timeLeft, violationCount, onFinish }) => {
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <header className="exam-header">
            <div className="exam-info">
                <h1>{title}</h1>
                <div className="exam-stats">
                    <span className="timer">{formatTime(timeLeft)}</span>
                    <span className={`strike-counter ${violationCount > 0 ? 'warning' : ''}`}>
                        Strikes: {violationCount} / 3
                    </span>
                </div>
            </div>
            <button className="submit-btn" onClick={onFinish}>Submit Exam</button>
        </header>
    );
};