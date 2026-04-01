import { useEffect, useState, useCallback } from 'react';

import { CreateExamModal } from './CreateExamModal';
import { ExamDetailsModal } from './ExamDetailsModal';

import { getExams } from '../api/api';

export const Admin = () => {
    const [listExams, setListExams] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(5); 

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [SelectedExam, setSelectedExam] = useState(null);

    const fetchExams = useCallback(async (page) => {
        try {
            const data = await getExams(page, pageSize);
            setListExams(data.content);
            setTotalPages(data.totalPages);
            setCurrentPage(data.number);
        } catch (err) {
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
        <div className="AdminOverall">
            <div className="AdminExamSection">
                <div className="AdminExamHeader">
                    <h2>Exams</h2>
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
                            <tr><td colSpan="3" style={{ textAlign: 'center' }}>No exams found.</td></tr>
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

                    <span>Page {currentPage + 1} of {totalPages}</span>

                    <button
                        disabled={currentPage === totalPages - 1 || totalPages === 0}
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