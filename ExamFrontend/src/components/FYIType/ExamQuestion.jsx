export const ExamQuestion = ({ question, index }) => {

    const options = Object.keys(question)
        .filter((key) => !isNaN(key))
        .sort((a, b) => Number(a) - Number(b)); 

    return (
        <div className="exam-question">
            <h4>
                Q{index + 1}. {question.Question}
            </h4>

            <ul>
                {options.map((key) => (
                    <li key={key}>
                        {key}. {question[key]}
                    </li>
                ))}
            </ul>

            <div className="exam-meta">
                <p>
                    <strong>Answer:</strong> {question.Ans}
                </p>
                <p>
                    <strong>Marks:</strong> {question.Marks}
                </p>
            </div>

            <hr />
        </div>
    );
};