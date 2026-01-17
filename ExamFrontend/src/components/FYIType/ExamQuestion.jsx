export const ExamQuestion = ({ question, index }) => {

    const options = Object.keys(question) //Should be fetch me all keys of the question object.
        .filter((key) => !isNaN(key)) //Should return all numeric "looking" keys, so we get 1 2 3 4 basically indices.
        .sort((a, b) => Number(a) - Number(b)); //Literally sort by index.

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