import { useEffect, useState, useCallback } from 'react';
import { getExams, searchExams } from '../api/api';
import { SubmissionDetailsModal } from './SubmissionDetailsModal';

// Importing the shared structural components
import { AdminSubmissionsHeader } from '../components/headerType/AdminSubmissionsHeader';
import { TableHeader } from '../components/tableType/CandidateResultsTableHeader';
import { AdminSubmissionsTableBody } from '../components/tableType/AdminSubmissions/AdminSubmissionsTableBody';
import { PageBar } from '../components/barType/PageBar';

import styles from './css/SubmissionsDashboard.module.css'; // Isolated modular layout styles

export const Submissions = () => {
    const [exams, setExams] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(5);

    const [selectedExam, setSelectedExam] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const tableHeaders = ["Exam Title", "Status", "Duration", "Action"];

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

    const handleSearchChange = useCallback((query) => {
        setSearchQuery(query);
    }, []);

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.submissionsSectionCard}>
                
                {/* Modular Header Section */}
                <div className={styles.sectionHeaderWrapper}>
                    <AdminSubmissionsHeader
                        searchQuery={handleSearchChange}
                    />
                </div>

                {/* Fluid Responsive Table Container */}
                <div className={styles.tableResponsiveContainer}>
                    <table className={styles.submissionsTable}>
                        <TableHeader headerArray={tableHeaders} />
                        <AdminSubmissionsTableBody
                            exams={exams}
                            searchQuery={searchQuery}
                            setSelectedExam={setSelectedExam}
                        />
                    </table>
                </div>

                {/* Standardized Modular Pagination Bar */}
                <div className={styles.paginationFooterWrapper}>
                    <PageBar
                        currentPage={currentPage}
                        totalPages={totalPages}
                        handlePageChange={handlePageChange}
                    />
                </div>
            </div>

            {/* State Protected Modal */}
            {selectedExam && (
                <SubmissionDetailsModal
                    exam={selectedExam}
                    onClose={() => setSelectedExam(null)}
                />
            )}
        </div>
    );
};