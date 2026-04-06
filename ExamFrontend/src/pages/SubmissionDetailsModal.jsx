import { useEffect, useState, useMemo } from 'react';
import { getSubmissionsByExam, sendResults, searchSubmissions, exportSubmissionsCsv } from '../api/api'; // Added exportSubmissionsCsv
import { useNavigate } from "react-router-dom";

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
    const [isDownloading, setIsDownloading] = useState(false); // Added download loading state
    const [resultSummary, setResultSummary] = useState(null);

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
        }, 500);
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

    const handleDownloadCSV = async () => {
        try {
            setIsDownloading(true);
            const response = await exportSubmissionsCsv(exam.id);
            
            // Create a blob from the response data
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            
            // Set filename (optionally parse from content-disposition if exposed)
            const filename = `${exam.title.replace(/\s+/g, '_')}_results.csv`;
            link.setAttribute("download", filename);
            
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed", err);
            alert("Failed to generate CSV export.");
        } finally {
            setIsDownloading(false);
        }
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
                        {/* Updated button with loading state */}
                        <button 
                            className="csv-btn" 
                            onClick={handleDownloadCSV} 
                            disabled={isDownloading}
                        >
                            {isDownloading ? "Preparing..." : "Download CSV"}
                        </button>
                        
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