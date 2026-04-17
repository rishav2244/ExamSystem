export const QuestionCard = ({ question, index, selectedOptionId, onSelect }) => (
    <div className="question-card">
        <div className="question-card-header">
            <span className="marks-badge">{question.marks} Marks</span>
            
            {selectedOptionId && (
                <button 
                    type="button"
                    className="clear-btn-secondary" 
                    onClick={() => onSelect(question.id, null)}
                >
                    Clear Choice
                </button>
            )}
        </div>

        <h2>Question {index + 1}</h2>
        <p className="question-text">{question.text}</p>

        <div className="options-list">
            {question.options.map((option) => (
                <label 
                    key={option.id} 
                    className={`option-item ${selectedOptionId === option.id ? 'selected' : ''}`}
                >
                    <input
                        type="radio"
                        name={question.id}
                        checked={selectedOptionId === option.id}
                        onChange={() => onSelect(question.id, option.id)}
                    />
                    <span className="option-index">{option.optionIndex + 1}</span>
                    {option.text}
                </label>
            ))}
        </div>
    </div>
);