export const CandidateExamCard = ({ exam, onJoin, isEligible }) => {

    const formatToLocalTime = (utcTime) => {
        if (!utcTime) return "-";
        return new Date(utcTime).toLocaleString();
    };

    return (
        <div className="CandidateExamCard">
            <div>
                <h3 className="exam-title">{exam.title}</h3>

                <p className="exam-meta">
                    <b>Duration:</b> {exam.duration} mins
                </p>
                <p className="exam-meta">
                    <b>Start:</b> {formatToLocalTime(exam.startTime)}
                </p>
                <p className="exam-meta">
                    <b>End:</b> {formatToLocalTime(exam.endTime)}
                </p>

            </div>

            <button
                className="CandidateActionButton"
                onClick={() => onJoin(exam.examId)}
            >
                {isEligible ? "Start Exam" : "Check Eligibility"}
            </button>
        </div>
    );
};
