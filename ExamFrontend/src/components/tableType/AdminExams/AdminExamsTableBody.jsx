export const AdminExamsTableBody = (
    {
        listExams,
        examSelected
    }
) => {
    return (
        <tbody>
            {listExams.length > 0 ? (
                listExams.map((exam) => (
                    <tr key={exam.id}>
                        <td>{exam.title}</td>
                        <td>
                            <span className={`status ${exam.status.toLowerCase()}`}>
                                {exam.status}
                            </span>
                        </td>
                        <td>
                            <button
                                className="ViewBtn"
                                onClick={() => examSelected(exam)}
                            >
                                View
                            </button>
                        </td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="3" style={{ textAlign: 'center' }}>
                        No exams found.
                    </td>
                </tr>
            )}
        </tbody>
    )
}