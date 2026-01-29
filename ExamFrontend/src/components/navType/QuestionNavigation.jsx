export const QuestionNavigation = ({ questions, currentIdx, selectedOptions, onNavClick }) => (
    <aside className="question-nav">
        <div className="nav-grid">
            {questions.map((q, i) => (
                <button 
                    key={q.id} 
                    className={`nav-item ${currentIdx === i ? 'active' : ''} ${selectedOptions[q.id] ? 'answered' : ''}`}
                    onClick={() => onNavClick(i)}
                >
                    {i + 1}
                </button>
            ))}
        </div>
    </aside>
);