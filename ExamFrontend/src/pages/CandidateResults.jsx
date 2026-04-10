import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCandidateResults, searchCandidateResults } from "../api/api";

export const CandidateResults = () => {
    const [results, setResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(5);
    
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    
    const navigate = useNavigate();

    // 1. Debounce Logic: Sync searchQuery to debouncedQuery
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // 2. Fetch Logic: Triggered by Page OR Debounced Query changes
    useEffect(() => {
        const loadData = async () => {
            try {
                let data;
                if (debouncedQuery.trim() !== "") {
                    // Execute Search
                    data = await searchCandidateResults(debouncedQuery, currentPage, pageSize);
                } else {
                    // Normal Fetch
                    data = await getCandidateResults(currentPage, pageSize);
                }
                
                if (data) {
                    setResults(data.content || []);
                    setTotalPages(data.totalPages || 0);
                }
            } catch (err) {
                console.error("Fetch Execution Error:", err);
            }
        };

        loadData();
    }, [currentPage, debouncedQuery, pageSize]);

    // 3. Reset page to 0 immediately when user types
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(0); 
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Pagination Input (No debounce per your rule)
    const handlePaginationInput = (e) => {
        const val = e.target.value;
        if (val === "" || isNaN(val)) return;
        const pageNum = parseInt(val, 10) - 1;
        if (pageNum >= 0 && pageNum < totalPages) {
            setCurrentPage(pageNum);
        }
    };

    return (
        <div className="results-page">
            <div className="top-bar">
                <div className="top-bar-left">
                    <button className="back-btn" onClick={() => navigate("/candidate/dashboard")}>Back</button>
                    <div className="page-title">
                        <h2>Results</h2>
                        <p>Your exam performance overview</p>
                    </div>
                </div>

                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by exam title..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            <div className="table-card">
                <table className="results-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Exam Title</th>
                            <th>Date</th>
                            <th>Score</th>
                            <th>Percentage</th>
                            <th>Status</th>
                            <th>Time</th>
                        </tr>
                    </thead>
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
                </table>
                
                {totalPages > 1 && (
                    <div className="UserPagination">
                        <button disabled={currentPage === 0} onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
                        <div className="page-jump-container">
                            <span>Page</span>
                            <input 
                                type="number" 
                                className="page-input"
                                value={currentPage + 1}
                                onChange={handlePaginationInput}
                                min="1"
                                max={totalPages}
                            />
                            <span>of {totalPages}</span>
                        </div>
                        <button disabled={currentPage >= totalPages - 1} onClick={() => handlePageChange(currentPage + 1)}>Next</button>
                    </div>
                )}
            </div>
        </div>
    );
};