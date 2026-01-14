export const ExamCard = ({ examName, examStatus, onClick }) => {
    return (
        <button
            className="ExamCard"
            onClick={onClick}>
            <h2>
                {examName}
            </h2>
            <h3>
                {examStatus}
            </h3>
        </button>
    )
}
