import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExams } from '../api/api';
import { SubmissionDetailsModal } from './SubmissionDetailsModal';

export const Submissions = () => {
    const [exams, setExams] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(5);

    const [selectedExam, setSelectedExam] = useState(null);
    const navigate = useNavigate();

    const fetchExams = useCallback(async (page) => {
        try {
            const data = await getExams(page, pageSize);

            setExams(data.content);
            setTotalPages(data.totalPages);
            setCurrentPage(data.number);
        } catch (err) {
            console.error("Error fetching exams for submissions:", err);
        }
    }, [pageSize]);

    useEffect(() => {
        fetchExams(0);
    }, [fetchExams]);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchExams(newPage);
        }
    };

    return (
        <div className="SubmissionsPage">
            <h2>Exam Submissions</h2>
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
                        <tr><td colSpan="4" style={{ textAlign: 'center' }}>No exams found.</td></tr>
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