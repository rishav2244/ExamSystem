import { useEffect, useState, useCallback } from 'react';
import { CreateExamModal } from './CreateExamModal';
import { ExamDetailsModal } from './ExamDetailsModal';
import { getExams, searchExams } from '../api/api';
import { AdminExamHeader } from '../components/headerType/AdminExamHeader';
import { TableHeader } from '../components/tableType/CandidateResultsTableHeader';
import { AdminExamsTableBody } from '../components/tableType/AdminExams/AdminExamsTableBody';
import { PageBar } from '../components/barType/PageBar';
import styles from './css/AdminDashboard.module.css'; // Using isolated styling

export const Admin = () => {
    const [listExams, setListExams] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [SelectedExam, setSelectedExam] = useState(null);

    const tableHeader = [
        "Exam name",
        "Status",
        "Actions"
    ];

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

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchExams(newPage);
        }
    };

    const searchChange = (searchQuery) => {
        setSearchTerm(searchQuery);
    };

    const onExamSelected = (exam) => {
        setSelectedExam(exam);
    };

    useEffect(() => {
        fetchExams(0);
    }, [searchTerm, fetchExams]);

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.examSectionCard}>
                {/* Search & Action bar wrapper */}
                <div className={styles.sectionHeaderWrapper}>
                    <AdminExamHeader
                        debouncedSearchTerm={searchChange}
                        setIsCreateModalOpen={setIsCreateModalOpen}
                    />
                </div>

                {/* Fluid Table Responsive Viewport */}
                <div className={styles.tableResponsiveContainer}>
                    <table className={styles.examTable}>
                        <TableHeader headerArray={tableHeader} />
                        <AdminExamsTableBody
                            examSelected={onExamSelected}
                            listExams={listExams}
                        />
                    </table>
                </div>

                {/* Pagination Controls Footer Container */}
                <div className={styles.paginationFooterWrapper}>
                    <PageBar
                        currentPage={currentPage}
                        handlePageChange={handlePageChange}
                        totalPages={totalPages}
                    />
                </div>
            </div>

            {/* Modals remain structurally untouched to protect functionality */}
            {isCreateModalOpen && (
                <CreateExamModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onExamCreated={() => fetchExams(currentPage)} 
                />
            )}

            {SelectedExam && (
                <ExamDetailsModal
                    exam={SelectedExam}
                    onClose={() => setSelectedExam(null)}
                    onQuestionsUploaded={() => fetchExams(currentPage)} 
                />
            )}
        </div>
    );
};