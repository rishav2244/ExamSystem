export const CandidateExamCard = ({ exam, onJoin, isEligible }) => {
    return (
        <div className="CandidateExamCard">
            <div>
                <h3 className="exam-title">{exam.title}</h3>

                <p className="exam-meta">
                    <b>Duration:</b> {exam.duration} mins
                </p>
                <p className="exam-meta">
                    <b>Start:</b> {exam.startTime}
                </p>
                <p className="exam-meta">
                    <b>End:</b> {exam.endTime}
                </p>
                <p className="exam-meta">
                    <b>Status:</b> {exam.candidateStatus}
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
