export const CandidateTableBody = (
    {
        results,
        currentPage,
        pageSize
    }
) => {
    return (
        <tbody>
            {results.length === 0 ? (
                <tr><td colSpan="7" className="empty">No results available</td></tr>
            ) : (
                results.map((res, index) => {
                    const percent = ((res.score / res.totalScore) * 100).toFixed(1);
                    const rowNumber = (currentPage * pageSize) + index + 1;
                    return (
                        <tr key={`${res.title}-${index}`}>
                            <td className="index">{rowNumber}</td>
                            <td className="title"><strong>{res.title}</strong></td>
                            <td className="date">
                                {new Date(res.date).toLocaleDateString()}
                                <div className="sub-text">{new Date(res.date).toLocaleTimeString()}</div>
                            </td>
                            <td className="score">{res.score}<span> / {res.totalScore}</span></td>
                            <td className={`percent ${percent >= 50 ? "good" : "bad"}`}>{percent}%</td>
                            <td><span className={`status ${res.passed ? "pass" : "fail"}`}>{res.passed ? "Pass" : "Fail"}</span></td>
                            <td className="time">{res.timeTaken} min</td>
                        </tr>
                    );
                })
            )}
        </tbody>
    )
}
