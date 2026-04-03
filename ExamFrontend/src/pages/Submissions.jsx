import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExams, searchExams } from '../api/api';
import { SubmissionDetailsModal } from './SubmissionDetailsModal';

export const Submissions = () => {
    const [exams, setExams] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(5);

    const [selectedExam, setSelectedExam] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery.trim());
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchExams = useCallback(async (page, query = '') => {
        try {
            let data;

            if (query) {
                data = await searchExams(query, page, pageSize);
            } else {
                data = await getExams(page, pageSize);
            }

            setExams(data.content || []);
            setTotalPages(data.totalPages || 0);
            setCurrentPage(data.number || 0);
        } catch (err) {
            console.error("Error fetching exams for submissions:", err);
            setExams([]);
            setTotalPages(0);
        }
    }, [pageSize]);

    useEffect(() => {
        fetchExams(0, debouncedQuery);
    }, [fetchExams, debouncedQuery]);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchExams(newPage, debouncedQuery);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const clearSearch = () => {
        setSearchQuery('');
    };

    return (
        <div className="SubmissionsPage">
            <h2>Exam Submissions</h2>

            <div className="SearchContainer" style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    className="SearchInput"
                    placeholder="Search exams by title..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
                {searchQuery && (
                    <button className="SearchClearBtn" onClick={clearSearch}>
                        ×
                    </button>
                )}
            </div>

            <button
                className="btn-view-overall-stats"
                onClick={() => navigate('overall')}
            >
                View overall statistics
            </button>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Exam Title</th>
                        <th>Status</th>
                        <th>Duration</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {exams.length > 0 ? (
                        exams.map(exam => (
                            <tr key={exam.id}>
                                <td>{exam.title}</td>
                                <td>{exam.status}</td>
                                <td>{exam.duration} mins</td>
                                <td>
                                    <button onClick={() => setSelectedExam(exam)}>View Results</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'center' }}>
                                {searchQuery ? 'No exams found matching your search.' : 'No exams found.'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="pagination-wrapper" style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                    disabled={currentPage === 0}
                    onClick={() => handlePageChange(currentPage - 1)}
                >
                    Previous
                </button>

                <span style={{ margin: '0 15px' }}>
                    Page {currentPage + 1} of {totalPages}
                </span>

                <button
                    disabled={currentPage === totalPages - 1 || totalPages === 0}
                    onClick={() => handlePageChange(currentPage + 1)}
                >
                    Next
                </button>
            </div>

            {selectedExam && (
                <SubmissionDetailsModal
                    exam={selectedExam}
                    onClose={() => setSelectedExam(null)}
                />
            )}
        </div>
    );
};