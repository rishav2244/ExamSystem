import { useEffect, useState, useMemo } from 'react';
import { getSubmissionsByExam, sendResults, searchSubmissions } from '../api/api';
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";

export const SubmissionDetailsModal = ({ exam, onClose }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: 'submittedAt', direction: 'desc' });

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;

    const navigate = useNavigate();
    const [sendingResults, setSendingResults] = useState(false);
    const [resultSummary, setResultSummary] = useState(null);

    // 1. Unified Fetching Logic
    const fetchSubmissions = async (page, query) => {
        setLoading(true);
        try {
            let data;
            if (query.trim()) {
                data = await searchSubmissions(exam.id, query, page, pageSize);
            } else {
                data = await getSubmissionsByExam(exam.id, page, pageSize);
            }
            setSubmissions(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setCurrentPage(0); 
            fetchSubmissions(0, searchTerm);
        }, 500); // 500ms debounce

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);
    useEffect(() => {
        fetchSubmissions(currentPage, searchTerm);
    }, [currentPage]);
    const sortedData = useMemo(() => {
        let processed = [...submissions];
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
    }, [submissions, sortConfig]);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && (totalPages === 0 || newPage < totalPages)) {
            setCurrentPage(newPage);
        }
    };

    const requestSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString() : "N/A";

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
            const response = await sendResults(exam.id);
            setResultSummary(response);
        } catch (err) {
            alert("Failed to send results");
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
                    {/* New Debounced Search UI with provided CSS classes */}
                    <div className="SearchContainer">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="SearchInput"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button 
                                className="SearchClearBtn" 
                                onClick={() => setSearchTerm("")}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    
                    <div className='submissions-details-buttons-div'>
                        <button className="csv-btn" onClick={handleDownloadCSV}>Download CSV</button>
                        <button className="stats-btn" onClick={() => navigate(`/admin/exam-statistics/${exam.id}`, { state: { exam, submissions } })}>
                            View Statistics
                        </button>
                        <button className="send-results-btn" onClick={handleSendResults} disabled={sendingResults}>
                            {sendingResults ? "Sending..." : "Send Results"}
                        </button>
                    </div>
                </div>

                {resultSummary && (
                    <div className="result-mail-summary">
                        <p><strong>Total Attempted:</strong> {resultSummary.attempted}</p>
                        <p><strong>Failed:</strong> {resultSummary.failed ?? 0}</p>
                    </div>
                )}

                {loading ? <p>Loading...</p> : (
                    <>
                        <div className="table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th onClick={() => requestSort('candidateName')} className="sortable">Candidate</th>
                                        <th>Email</th>
                                        <th onClick={() => requestSort('score')} className="sortable">Score</th>
                                        <th onClick={() => requestSort('violations')} className="sortable">Violations</th>
                                        <th>Time Taken</th>
                                        <th onClick={() => requestSort('submittedAt')} className="sortable">Submitted</th>
                                        <th onClick={() => requestSort('passed')} className="sortable">Result</th>
                                        <th>Status</th>
                                        <th>Mailed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.map(sub => (
                                        <tr key={sub.id} className="clickable-row" onClick={() => navigate(`/admin/submissions/${sub.id}`, { state: { sub } })}>
                                            <td>{sub.candidateName}</td>
                                            <td>{sub.candidateEmail}</td>
                                            <td>{sub.score?.toFixed(2)}</td>
                                            <td className={sub.violations > 0 ? "warning-text" : ""}>{sub.violations}</td>
                                            <td>{sub.timeTaken} min</td>
                                            <td>{formatDate(sub.submittedAt)}</td>
                                            <td><span className={`result-badge ${sub.passed ? 'pass' : 'fail'}`}>{sub.passed ? "PASS" : "FAIL"}</span></td>
                                            <td><span className={`status-badge ${sub.status}`}>{sub.status}</span></td>
                                            <td><span className={`mailed-badge ${sub.mailed ? 'sent' : 'pending'}`}>{sub.mailed ? "Mailed" : "Not Mailed"}</span></td>
                                        </tr>
                                    ))}
                                    {sortedData.length === 0 && (
                                        <tr>
                                            <td colSpan="9" style={{textAlign: 'center', padding: '20px'}}>No submissions found matching your search.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="UserPagination">
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)} 
                                disabled={currentPage === 0}
                            >
                                Previous
                            </button>
                            
                            <div className="page-jump-container">
                                <span>Page</span>
                                <input 
                                    type="number" 
                                    className="page-input"
                                    value={currentPage + 1}
                                    onChange={(e) => handlePageChange(Number(e.target.value) - 1)}
                                />
                                <span>of {totalPages || 1}</span>
                            </div>

                            <button 
                                onClick={() => handlePageChange(currentPage + 1)} 
                                disabled={currentPage >= totalPages - 1 || totalPages === 0}
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};