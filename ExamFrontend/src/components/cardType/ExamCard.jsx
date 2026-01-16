export const ExamCard = ({ exam , onClick }) => {
    return (
        <button
            className="ExamCard"
            onClick={() => onClick(exam)}>
            <h2>
                {exam.title}
            </h2>
            <h3>
                {exam.status}
            </h3>
        </button>
    )
}
