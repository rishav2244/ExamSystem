export const ExamCard = ({ examName, examStatus }) => {
    return (
        <button
            className="ExamCard">
            <h2>
                {examName}
            </h2>
            <h3>
                {examStatus}
            </h3>
        </button>
    )
}
