export const ExamQuestionDraft = ({ question, index, onChange }) => {
    const options = Object.keys(question)
        .filter((key) => !isNaN(key))
        .sort((a, b) => Number(a) - Number(b));

    const handleFieldChange = (key, value) => {
        onChange(index, key, value);
    };

    return (
        <div className="exam-question" style={{ marginBottom: '20px', borderBottom: '1px solid #ccc' }}>
            <label>Question {index + 1}:</label>
            <input
                type="text"
                value={question.Question}
                onChange={(e) => handleFieldChange("Question", e.target.value)}
                style={{ width: '100%', marginBottom: '10px' }}
            />

            <div className="options-grid">
                {options.map((key) => (
                    <div key={key} style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                        <span>{key}.</span>
                        <input
                            type="text"
                            value={question[key]}
                            onChange={(e) => handleFieldChange(key, e.target.value)}
                        />
                    </div>
                ))}
            </div>

            <div className="exam-meta" style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                <label>
                    Correct Ans:
                    <select
                        value={question.Ans}
                        onChange={(e) => handleFieldChange("Ans", e.target.value)}
                    >
                        <option value="">Select Answer</option>
                        {options.map(key => (
                            <option key={key} value={question[key]}>
                                Option {key}: {question[key]}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Marks:
                    <input
                        type="number"
                        value={question.Marks}
                        onChange={(e) => handleFieldChange("Marks", e.target.value)}
                    />
                </label>
            </div>
        </div>
    );
};