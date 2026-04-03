import { useEffect, useState, useCallback } from 'react';
import { CreateExamModal } from './CreateExamModal';
import { ExamDetailsModal } from './ExamDetailsModal';
import { getExams, searchExams } from '../api/api';

export const Admin = () => {
    const [listExams, setListExams] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(5);
    
    // Search State
    const [searchTerm, setSearchTerm] = useState("");

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [SelectedExam, setSelectedExam] = useState(null);

    /**
     * unified fetch logic: 
     * If searchTerm exists, use searchExams API.
     * Otherwise, use the standard getExams API.
     */
    const fetchExams = useCallback(async (page, query = searchTerm) => {
        try {
            let data;
            if (query.trim() !== "") {
                data = await searchExams(query, page, pageSize);
            } else {
                data = await getExams(page, pageSize);
            }
            
            setListExams(data.content || []);
            setTotalPages(data.totalPages || 0);
            setCurrentPage(data.number || 0);
        } catch (err) {
            console.error("Failed to fetch exams", err);
        }
    }, [pageSize, searchTerm]);

    useEffect(() => {
        // Debounce search or simple fetch on mount
        const delayDebounceFn = setTimeout(() => {
            fetchExams(0);
        }, 300); // 300ms debounce to prevent spamming API on every keystroke

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, fetchExams]);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchExams(newPage);
        }
    };

    const clearSearch = () => {
        setSearchTerm("");
        fetchExams(0, ""); // Force immediate fetch of all exams
    };

    return (
        <div className="AdminOverall">
            <div className="AdminExamSection">
                <div className="AdminExamHeader">
                    <h2>Exams</h2>
                    
                    {/* Added Search Bar */}
                    <div className="SearchContainer">
                        <input
                            type="text"
                            className="SearchInput"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button className="SearchClearBtn" onClick={clearSearch}>
                                &times;
                            </button>
                        )}
                    </div>

                    <button
                        className="CreateExamBtn"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        + Create Exam
                    </button>
                </div>

                <table className="ExamTable">
                    <thead>
                        <tr>
                            <th>Exam Name</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
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
                                            onClick={() => setSelectedExam(exam)}
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
                </table>
                
                <div className="PaginationControls">
                    <button
                        disabled={currentPage === 0}
                        onClick={() => handlePageChange(currentPage - 1)}
                    >
                        Previous
                    </button>

                    <span>Page {currentPage + 1} of {totalPages || 1}</span>

                    <button
                        disabled={currentPage >= totalPages - 1 || totalPages === 0}
                        onClick={() => handlePageChange(currentPage + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>

            {isCreateModalOpen && (
                <CreateExamModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onExamCreated={() => fetchExams(currentPage)} />
            )}

            {SelectedExam && (
                <ExamDetailsModal
                    exam={SelectedExam}
                    onClose={() => setSelectedExam(null)}
                    onQuestionsUploaded={() => fetchExams(currentPage)} />
            )}
        </div>
    );
};