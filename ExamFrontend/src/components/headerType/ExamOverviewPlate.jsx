export const ExamOverviewPlate = ({ exam }) => {
    if (!exam) return null;

    const calculatedCutoff = ((exam.totalMarks * exam.cutoff) / 100).toFixed(2);
    
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="modal-exam-header">
            <div className="exam-title-row">
                <h2 className="exam-title">{exam.title}</h2>
                <p className={`exam-status-text ${exam.status.toLowerCase()}`}>
                    Status: {exam.status}
                </p>
            </div>

            <div className="exam-info-grid">
                <div className="exam-info-card">
                    <span className="label">Start Time</span>
                    <span className="value">
                        {formatDate(exam.startTime)}
                    </span>
                </div>

                <div className="exam-info-card">
                    <span className="label">End Time</span>
                    <span className="value">
                        {formatDate(exam.endTime)}
                    </span>
                </div>

                <div className="exam-info-card">
                    <span className="label">Total Marks</span>
                    <span className="value">{exam.totalMarks}</span>
                </div>

                <div className="exam-info-card">
                    <span className="label">Cutoff Marks</span>
                    <span className="value">{calculatedCutoff}</span>
                </div>

                {/* New Resumable Field */}
                <div className="exam-info-card">
                    <span className="label">Resumable</span>
                    <span className="value">
                        {exam.allowResume ? "Yes" : "No"}
                    </span>
                </div>
            </div>
        </div>
    );
};