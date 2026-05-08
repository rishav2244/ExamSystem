export const ExamActionTray = ({
    examStatus,
    isPending,
    csvQuestionsExist,
    cutoff,
    setCutoff,
    selectedGroupId,
    onDelete,
    onSaveQuestions,
    onPublish
}) => {
    return (
        <div className="modal-footer">
            <button
                onClick={onDelete}
                className="DeleteExamButton"
            >
                Delete Exam
            </button>

            {isPending && csvQuestionsExist && (
                <div className="save-actions-container">
                    <div className="cutoff-input-wrapper">
                        <label>Pass Cutoff (%): </label>
                        <input
                            type="number"
                            value={cutoff}
                            onChange={(e) => setCutoff(e.target.value)}
                            min="0"
                            max="100"
                            className="cutoff-input"
                        />
                    </div>
                    <button
                        onClick={onSaveQuestions}
                        className="QuestionsSaveButton"
                    >
                        Save Questions to Exam
                    </button>
                </div>
            )}

            {examStatus === "SAVED" && selectedGroupId !== "" && (
                <button
                    onClick={onPublish}
                    className="PublishExamButton"
                >
                    Confirm & Publish Exam
                </button>
            )}
        </div>
    );
};