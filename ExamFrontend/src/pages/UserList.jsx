import { useEffect, useState, useRef, useCallback } from 'react';
import { UserDetailsModal } from "./UserDetailsModal";
import { CreateUserModal } from './CreateUserModal';
import { getAllUsers, searchUsers } from "../api/api";
import { AdminUserHeader } from '../components/headerType/AdminUserHeader';
import { TableHeader } from '../components/tableType/CandidateResultsTableHeader';
import { AdminUsersTableBody } from '../components/tableType/AdminUsers/AdminUsersTableBody';
import { PageBar } from '../components/barType/PageBar';

export const UserList = () => {
    const isInitialMount = useRef(true);

    const [pageData, setPageData] = useState({ content: [], totalPages: 0, totalElements: 0 });
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const tableHeaders = ["Name", "Email", "Role", "Action"];

    // Centralized fetch logic
    const fetchUsers = async (page, query) => {
        try {
            let data;
            if (query && query.trim() !== "") {
                data = await searchUsers(query, page, pageSize);
            } else {
                data = await getAllUsers(page, pageSize);
            }
            setPageData(data);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        }
    };

    // Listen for page or search changes
    useEffect(() => {
        fetchUsers(currentPage, searchTerm);

        if (isInitialMount.current) {
            isInitialMount.current = false;
        }
    }, [currentPage, searchTerm]);

    // This function is passed to PageBar
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleSearchChange = useCallback((query) => {
        setSearchTerm(query);
        setCurrentPage(0); // Reset to first page on new search
    }, []);

    const handleCreateModalOpen = (isOpen) => {
        setIsCreateModalOpen(isOpen);
    };

    const handleUserSelection = (usr) => {
        setSelectedUser(usr);
    };

    return (
        <div className="UserListOverall">
            <div className="AdminUserSection">
                <AdminUserHeader
                    searchBar={handleSearchChange}
                    setIsCreateModalOpen={handleCreateModalOpen}
                    userCount={pageData.totalElements}
                />

                <table className="UserTable">
                    <TableHeader headerArray={tableHeaders} />
                    <AdminUsersTableBody
                        pageData={pageData}
                        setSelectedUser={handleUserSelection}
                    />
                </table>

                {/* Integrated Reusable Component */}
                <PageBar
                    currentPage={currentPage}
                    totalPages={pageData.totalPages}
                    handlePageChange={handlePageChange}
                />
            </div>

            {isCreateModalOpen && (
                <CreateUserModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onUserCreated={() => fetchUsers(currentPage, searchTerm)}
                />
            )}

            {selectedUser && (
                <UserDetailsModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </div>
    );
};