import { ExamQuestion } from "./ExamQuestion";
import { ExamQuestionDraft } from "./ExamQuestionDraft";

export const QuestionWorkbench = ({
    isPending,
    onCSVUpload,
    csvQuestions,
    onDraftChange,
    backendQuestions
}) => {
    return (
        <div className="question-workbench-area">
            {isPending ? (
                <div className="upload-section">
                    <h3>Upload Questions (CSV)</h3>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={onCSVUpload}
                    />

                    {csvQuestions && csvQuestions.length > 0 && (
                        <div className="exam-questions-container">
                            {csvQuestions.map((q, index) => (
                                <ExamQuestionDraft
                                    key={index}
                                    question={q}
                                    index={index}
                                    onChange={onDraftChange}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="view-section">
                    <h3>Exam Questions</h3>
                    <div className="exam-questions-container">
                        {backendQuestions.map((q, index) => (
                            <ExamQuestion
                                key={index}
                                question={q}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};