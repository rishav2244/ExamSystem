import { useEffect, useState, useMemo } from 'react';
import { getSubmissionsByExam } from '../api/api';
import { useNavigate } from "react-router-dom";

import Papa from "papaparse";

import { sendResults } from '../api/api';

export const SubmissionDetailsModal = ({ exam, onClose }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: 'submittedAt', direction: 'desc' });

    const navigate = useNavigate();
    const [sendingResults, setSendingResults] = useState(false);
    const [resultSummary, setResultSummary] = useState(null);
    const [sendError, setSendError] = useState(null);

    useEffect(() => {
        getSubmissionsByExam(exam.id)
            .then(data => {
                setSubmissions(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [exam.id]);


    const filteredAndSortedData = useMemo(() => {
        let processed = submissions.filter(sub =>
            sub.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortConfig.key) {
            processed.sort((a, b) => {
                let aVal = a[sortConfig.key] ?? 0;
                let bVal = b[sortConfig.key] ?? 0;

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return processed;
    }, [submissions, searchTerm, sortConfig]);

    const requestSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString() : "N/A";

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return "↕️";
        return sortConfig.direction === 'asc' ? "↑" : "↓";
    };
    const handleDownloadCSV = () => {
        const formattedData = submissions.map(sub => ({
            Name: sub.candidateName,
            Email: sub.candidateEmail,
            Score: sub.score,
            Result: sub.passed ? "PASS" : "FAIL"
        }));

        const csv = Papa.unparse(formattedData);

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${exam.title}_results.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const handleSendResults = async () => {
        try {
            setSendingResults(true);
            setSendError(null);

            const response = await sendResults(exam.id);

            setResultSummary(response);
        } catch (err) {
            setSendError("Failed to send results");
        } finally {
            setSendingResults(false);
        }
    };
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-window wide-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <h2>Results: {exam.title}</h2>

                <div className="modal-actions">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="table-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="csv-btn" onClick={handleDownloadCSV}>
                        Download CSV
                    </button>
                    <button
                        className="stats-btn"
                        onClick={() =>
                            navigate(`/admin/exam-statistics/${exam.id}`, {
                                state: {
                                    exam,
                                    submissions
                                }
                            })
                        }
                    >
                        View Statistics
                    </button>
                    <button
                        className="send-results-btn"
                        onClick={handleSendResults}
                        disabled={sendingResults}
                    >
                        {sendingResults ? "Sending..." : "Send Results"}
                    </button>
                </div>
                {resultSummary && (
                    <div className="result-mail-summary">
                        <p><strong>Total Attempted:</strong> {resultSummary.attempted}</p>
                        <p><strong>Failed:</strong> {resultSummary.failed ?? 0}</p>
                        {(resultSummary.emailInfo?.length ?? 0) > 0 && (
                            <div className="failure-box">
                                <p><strong>Failed Emails:</strong></p>
                                <ul>
                                    {resultSummary.emailInfo.map((fail, idx) => (
                                        <li key={idx}>
                                            {fail.email} — {fail.message}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
                {sendError && <p className="error-text">{sendError}</p>}
                {loading ? <p>Loading...</p> : (
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th onClick={() => requestSort('candidateName')} className="sortable">
                                        Candidate {getSortIcon('candidateName')}
                                    </th>
                                    <th>Email</th>
                                    <th onClick={() => requestSort('score')} className="sortable">
                                        Score {getSortIcon('score')}
                                    </th>
                                    <th onClick={() => requestSort('violations')} className="sortable">
                                        Violations {getSortIcon('violations')}
                                    </th>
                                    <th>Time Taken</th>
                                    <th onClick={() => requestSort('submittedAt')} className="sortable">
                                        Submitted {getSortIcon('submittedAt')}
                                    </th>
                                    <th onClick={() => requestSort('passed')} className="sortable">
                                        Result {getSortIcon('passed')}
                                    </th>
                                    <th>Status</th>
                                    <th>Mailed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAndSortedData.map(sub => (
                                    <tr
                                        key={sub.id}
                                        className="clickable-row"
                                        onClick={() => navigate(`/admin/submissions/${sub.id}`, { state: { sub } })}
                                    >
                                        <td>{sub.candidateName}</td>
                                        <td>{sub.candidateEmail}</td>
                                        <td>{sub.score?.toFixed(2)}</td>
                                        <td className={sub.violations > 0 ? "warning-text" : ""}>
                                            {sub.violations}
                                        </td>
                                        <td>{sub.timeTaken} min</td>
                                        <td>{formatDate(sub.submittedAt)}</td>
                                        <td>
                                            <span className={`result-badge ${sub.passed ? 'pass' : 'fail'}`}>
                                                {sub.passed ? "PASS" : "FAIL"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${sub.status}`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`mailed-badge ${sub.mailed ? 'sent' : 'pending'}`}>
                                                {sub.mailed ? "Mailed" : "Not Mailed"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};