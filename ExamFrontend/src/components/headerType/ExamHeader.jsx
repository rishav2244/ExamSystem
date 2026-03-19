import { useConfirm } from "../popupType/useConfirm"; 
export const ExamHeader = ({ title, timeLeft, violationCount, onFinish, isDanger }) => {

    const { confirmPopup } = useConfirm();

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;

        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };
    const handleSubmitClick = async () => {

        const confirmed = await confirmPopup(
            "Are you sure you want to submit the exam? You cannot change answers after submission."
        );

        if (!confirmed) return;

        onFinish();
    };

    return (
        <header className="exam-header">

            <div className="exam-info">
                <h1>{title}</h1>

                <div className="exam-stats">

                    <div className={`exam-timer ${isDanger ? "danger" : ""}`}>
                        ⏱ {formatTime(timeLeft)}
                    </div>

                    <span className={`strike-counter ${violationCount > 0 ? 'warning' : ''}`}>
                        Strikes: {violationCount} / 3
                    </span>

                </div>
            </div>
            <button className="submit-btn" onClick={handleSubmitClick}>
                Submit Exam
            </button>

        </header>
    );
};