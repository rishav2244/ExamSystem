import styles from "./css/CandidateResultsTable.module.css"

export const CandidateResultsTable = ({ results, headers = [] }) => {

    const formatValue = (key, value) => {
        // 1. Handle Boolean (PASS/FAIL)
        if (typeof value === 'boolean') {
            return value ? "PASS" : "FAIL";
        }

        // 2. Handle Date (ISO String/Instant to Local)
        // We check the key name 'date' or if it looks like an ISO string
        if (key === 'date' && value) {
            return new Date(value).toLocaleString();
            // .toLocaleString() automatically uses the device's local timezone
        }

        return String(value);
    };

    const getColumnType = (key, value) => {
        if (typeof value === 'boolean') return 'status';
        if (typeof value === 'number') return 'numeric';
        return 'text';
    };

    return (
        <table className="resultsTable">
            <thead>
                <tr>
                    {headers.map(key => (
                        <th key={key} dataColType={getColumnType(key, results[0]?.[key])}>
                            {key.toUpperCase()}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {results.length > 0 ? (
                    results.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {headers.map(key => (
                                <td
                                    key={key}
                                    data-col-type={getColumnType(key, row[key])}
                                    className={typeof row[key] === 'boolean' ? (row[key] ? 'pass-text' : 'fail-text') : ''}
                                >
                                    {formatValue(key, row[key])}
                                </td>
                            ))}
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={headers.length || 1} className="empty">No data found</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}