import { useEffect, useState, useRef } from 'react';
import { UserDetailsModal } from "./UserDetailsModal";
import { CreateUserModal } from './CreateUserModal';
import { getAllUsers, searchUsers } from "../api/api";

export const UserList = () => {
    const DEBOUNCE_DELAY = 600;
    const isInitialMount = useRef(true);

    const [pageData, setPageData] = useState({ content: [], totalPages: 0, totalElements: 0 });
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(5);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [jumpPage, setJumpPage] = useState("");

    const fetchUsers = async (page, query) => {
        try {
            let data;
            if (query && query.trim() !== "") {
                data = await searchUsers(query, page, pageSize);
            } else {
                data = await getAllUsers(page, pageSize);
            }
            setPageData(data);
            setJumpPage(page + 1);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        }
    };
    useEffect(() => {
        if (isInitialMount.current) {
            return;
        }

        const handler = setTimeout(() => {
            fetchUsers(currentPage, searchTerm);
        }, DEBOUNCE_DELAY);

        return () => clearTimeout(handler);
    }, [searchTerm]);
    useEffect(() => {
        fetchUsers(currentPage, searchTerm);
        
        if (isInitialMount.current) {
            isInitialMount.current = false;
        }
    }, [currentPage]);

    const handlePageJump = (e) => {
        e.preventDefault();
        const p = parseInt(jumpPage) - 1;
        if (p >= 0 && p < pageData.totalPages) {
            setCurrentPage(p);
        } else {
            setJumpPage(currentPage + 1);
        }
    };

    return (
        <div className="UserListOverall">
            <div className="AdminUserSection">
                <div className="AdminUserHeader">
                    <h2>Users (Total: {pageData.totalElements})</h2>
                    
                    <div className="AdminHeaderActions">
                        <div className="SearchContainer">
                            <input 
                                type="text" 
                                className="SearchInput"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(0);
                                }}
                            />
                            {searchTerm && (
                                <button className="SearchClearBtn" onClick={() => setSearchTerm("")}>
                                    &times;
                                </button>
                            )}
                        </div>
                        <button className="CreateUserBtn" onClick={() => setIsCreateModalOpen(true)}>
                            + Create User
                        </button>
                    </div>
                </div>

                <table className="UserTable">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageData.content.length > 0 ? (
                            pageData.content.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="ViewBtn" onClick={() => setSelectedUser(user)}>
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="UserPagination">
                    <button
                        disabled={currentPage === 0}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                        Prev
                    </button>

                    <form onSubmit={handlePageJump} className="page-jump-container">
                        <span>Page</span>
                        <input
                            type="number"
                            className="page-input"
                            value={jumpPage}
                            onChange={(e) => setJumpPage(e.target.value)}
                            min="1"
                            max={pageData.totalPages}
                        />
                        <span>of {pageData.totalPages}</span>
                    </form>

                    <button
                        disabled={currentPage >= pageData.totalPages - 1}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        Next
                    </button>
                </div>
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