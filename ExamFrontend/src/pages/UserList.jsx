import { useEffect, useState } from 'react';
import { CreateUserCard } from "../components/cardType/CreateUserCard";
import { UserCard } from "../components/cardType/UserCard";
import { UserDetailsModal } from "./UserDetailsModal";
import { CreateUserModal } from './CreateUserModal';
import { getAllUsers } from "../api/api";

export const UserList = () => {
    const [listUsers, setListUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");

    const fetchUsers = async () => {
        try {
            const users = await getAllUsers();
            setListUsers(users);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const filteredUsers = listUsers.filter((user) => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="UserListOverall">
            <div className="filter-bar">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="role-select"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="ALL">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="CANDIDATE">Candidate</option>
                </select>
                <div className="user-count">
                    Found: {filteredUsers.length}
                </div>
            </div>

            {/* <div className="CardArea">
                <CreateUserCard onClick={() => setIsCreateModalOpen(true)} />

                {filteredUsers.map((user) => (
                    <UserCard
                        key={user.id}
                        user={user}
                        onClick={() => setSelectedUser(user)}
                    />
                ))}
            </div> */}
            <div className="AdminUserSection">

                {/* Header */}
                <div className="AdminUserHeader">
                    <h2>Users</h2>
                    <button
                        className="CreateUserBtn"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        + Create User
                    </button>
                </div>

                {/* User Table */}
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
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>

                                <td>
                                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                                        {user.role}
                                    </span>
                                </td>

                                <td>
                                    <button
                                        className="ViewBtn"
                                        onClick={() => setSelectedUser(user)}
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>


            {isCreateModalOpen && (
                <CreateUserModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onUserCreated={fetchUsers}
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