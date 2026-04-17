import { useEffect, useState, useCallback } from "react";
import { getCandidateResults, searchCandidateResults } from "../api/api";
import styles from "./css/CandidateResults.module.css"
import { CandidateResultTopBar } from "../components/barType/CandidateResultTopBar";
import { TableHeader } from "../components/tableType/CandidateResultsTableHeader";
import { CandidateTableBody } from "../components/tableType/CandidateResults/CandidateTableBody";
import { PageBar } from "../components/barType/PageBar";

export const CandidateResults = () => {
    const [results, setResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");

    const tableHeaders = [
        "#",
        "Test Title",
        "Date",
        "Score",
        "Percentage",
        "Status",
        "Duration"
    ];

    useEffect(() => {
        const loadData = async () => {
            try {
                let data;
                if (searchQuery.trim() !== "") {
                    data = await searchCandidateResults(searchQuery, currentPage, pageSize);
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
    }, [currentPage, searchQuery, pageSize]);

    const handleSearchChange = useCallback((query) => {
        setSearchQuery(query);
        setCurrentPage(0);
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handlePaginationInput = (e) => {
        const val = e.target.value;
        if (val === "" || isNaN(val)) return;
        const pageNum = parseInt(val, 10) - 1;
        if (pageNum >= 0 && pageNum < totalPages) {
            setCurrentPage(pageNum);
        }
    };

    return (
        <div className={styles.resultsPage}>
            <CandidateResultTopBar
                debouncedQuery={handleSearchChange}
            />

            <div className="table-card">
                <table className="results-table">
                    <TableHeader
                        headerArray={tableHeaders}
                    />
                    <CandidateTableBody
                        currentPage={currentPage}
                        pageSize={pageSize}
                        results={results}
                    />
                </table>

                <PageBar
                    currentPage={currentPage}
                    handlePageChange={handlePageChange}
                    totalPages={totalPages}
                />
            </div>
        </div>
    );
};