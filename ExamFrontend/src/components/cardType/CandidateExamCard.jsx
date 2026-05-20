export const CandidateExamCard = ({ exam, onJoin, eligibilityAction }) => {

    const formatToLocalTime = (utcTime) => {
        if (!utcTime) return "-";
        return new Date(utcTime).toLocaleString();
    };

    const getButtonText = () => {
        if (eligibilityAction === "START") return "Start Exam";
        if (eligibilityAction === "RESUME") return "Resume Exam";
        return "Check Eligibility";
    };

    return (
        <div className="CandidateExamCard">
            <div>
                <h3 className="exam-title">{exam.title}</h3>
                <p className="exam-meta"><b>Duration:</b> {exam.duration} mins</p>
                <p className="exam-meta"><b>Start:</b> {formatToLocalTime(exam.startTime)}</p>
                <p className="exam-meta"><b>End:</b> {formatToLocalTime(exam.endTime)}</p>
            </div>

            <button
                className={`CandidateActionButton ${eligibilityAction ? 'active' : ''}`}
                onClick={() => onJoin(exam.examId)}
            >
                {getButtonText()}
            </button>
        </div>
    );
};