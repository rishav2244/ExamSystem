import { useEffect, useState, useRef, useCallback } from 'react';
import { getAllUserGroups, searchGroups } from "../api/api";
import { CreateGroupModal } from './CreateGroupModal';
import { GroupDetailsModal } from './GroupDetailsModal';

// Importing the shared structural components
import { AdminGroupHeader } from '../components/headerType/AdminGroupHeader';
import { TableHeader } from '../components/tableType/CandidateResultsTableHeader';
import { AdminGroupsTableBody } from '../components/tableType/AdminGroups/AdminGroupsTableBody';
import { PageBar } from '../components/barType/PageBar';

import styles from './css/GroupDashboard.module.css'; // Cleaner, isolated modular styling

export const GroupList = () => {
    const isInitialMount = useRef(true);

    const [groups, setGroups] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(5);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);

    const tableHeaders = ["Group Name", "Action"];

    const fetchGroups = async (page, query) => {
        try {
            let data;
            if (query && query.trim() !== "") {
                data = await searchGroups(query, page, pageSize);
            } else {
                data = await getAllUserGroups(page, pageSize);
            }

            setGroups(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (err) {
            console.error("Failed to fetch groups:", err);
        }
    };

    // Synchronized pagination and search triggers matching UserList logic
    useEffect(() => {
        fetchGroups(currentPage, searchTerm);

        if (isInitialMount.current) {
            isInitialMount.current = false;
        }
    }, [currentPage, searchTerm]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleSearchChange = useCallback((query) => {
        setSearchTerm(query);
        setCurrentPage(0); // Reset instantly to first page on new queries
    }, []);

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.groupSectionCard}>
                
                {/* Modular Header Section */}
                <div className={styles.sectionHeaderWrapper}>
                    <AdminGroupHeader
                        searchBar={handleSearchChange}
                        setIsCreateModalOpen={setIsCreateOpen}
                        groupCount={totalElements}
                    />
                </div>

                {/* Fluid Responsive Table Container */}
                <div className={styles.tableResponsiveContainer}>
                    <table className={styles.groupTable}>
                        <TableHeader headerArray={tableHeaders} />
                        <AdminGroupsTableBody
                            groups={groups}
                            setSelectedGroup={setSelectedGroup}
                        />
                    </table>
                </div>

                {/* Reused Modular Pagination Bar */}
                <div className={styles.paginationFooterWrapper}>
                    <PageBar
                        currentPage={currentPage}
                        totalPages={totalPages}
                        handlePageChange={handlePageChange}
                    />
                </div>
            </div>

            {/* State Protected Modals */}
            {isCreateOpen && (
                <CreateGroupModal
                    onClose={() => setIsCreateOpen(false)}
                    onGroupCreated={() => fetchGroups(currentPage, searchTerm)}
                />
            )}

            {selectedGroup && (
                <GroupDetailsModal
                    group={selectedGroup}
                    onClose={() => setSelectedGroup(null)}
                    onGroupDeleted={() => fetchGroups(0, searchTerm)}
                />
            )}
        </div>
    );
};