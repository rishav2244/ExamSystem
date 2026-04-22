import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExams, searchExams } from '../api/api';
import { SubmissionDetailsModal } from './SubmissionDetailsModal';
import { SearchBar } from '../components/barType/SearchBar';
import { AdminSubmissionsHeader } from '../components/headerType/AdminSubmissionsHeader';

export const Submissions = () => {
    const [exams, setExams] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(5);

    const [selectedExam, setSelectedExam] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

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
        fetchExams(0, searchQuery);
    }, [fetchExams, searchQuery]);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchExams(newPage, searchQuery);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e);
    };

    return (
        <div className="SubmissionsPage">

            <AdminSubmissionsHeader
                searchQuery={handleSearchChange}
            />

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
                    Prev
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