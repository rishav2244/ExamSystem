import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react";

export const CandidateResultTopBar = ({debouncedQuery}) => {

    const [searchBar, setSearchBar] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            debouncedQuery(searchBar);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchBar, debouncedQuery]);

    const handleQueryChange = (e) => {
        setSearchBar(e.target.value);
    };

    return (
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
                    value={searchBar}
                    onChange={handleQueryChange}
                />
            </div>
        </div>
    )
}
