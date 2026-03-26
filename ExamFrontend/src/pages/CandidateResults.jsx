import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCandidateResults } from "../api/api";

export const CandidateResults = () => {
    const [results, setResults] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const data = await getCandidateResults();
            setResults(data.candidateSubmissionDetailDTO || []);
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <div className="results-page">
            <div className="top-bar">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <span></span> Back
                </button>

                <div className="page-title">
                    <h2>Results</h2>
                    <p>Your exam performance overview</p>
                </div>
            </div>
            <div className="table-card">
                <table className="results-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Date</th>
                            <th>Score</th>
                            <th>Percentage</th>
                            <th>Status</th>
                            <th>Time</th>
                        </tr>
                    </thead>

                    <tbody>
                        {results.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="empty">
                                    No results available
                                </td>
                            </tr>
                        ) : (
                            results.map((res, index) => {
                                const percent = ((res.score / res.totalScore) * 100).toFixed(1);

                                return (
                                    <tr key={index}>
                                        <td className="index">{index + 1}</td>

                                        <td className="date">
                                            {new Date(res.date).toLocaleDateString()}
                                            <div className="sub-text">
                                                {new Date(res.date).toLocaleTimeString()}
                                            </div>
                                        </td>

                                        <td className="score">
                                            {res.score}
                                            <span> / {res.totalScore}</span>
                                        </td>

                                        <td className={`percent ${percent >= 50 ? "good" : "bad"}`}>
                                            {percent}%
                                        </td>

                                        <td>
                                            <span className={`status ${res.passed ? "pass" : "fail"}`}>
                                                {res.passed ? "Pass" : "Fail"}
                                            </span>
                                        </td>

                                        <td className="time">{res.timeTaken} min</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};