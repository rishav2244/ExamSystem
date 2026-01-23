import { useEffect, useState } from 'react';
// Components
import { CreateUserCard } from "../components/cardType/CreateUserCard";
import { UserCard } from "../components/cardType/UserCard";
import { UserDetailsModal } from "./UserDetailsModal";
// API
import { getAllUsers } from "../api/api";

export const UserList = () => {
    const [listUsers, setListUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    // 1. Fetching Logic
    const fetchUsers = async () => {
        try {
            const users = await getAllUsers();
            setListUsers(users);
        } catch (err) {
            console.error("Failed to fetch users:", err);
            alert("Could not load user list.");
        }
    };

    // 2. Lifecycle
    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="UserListOverall">
            <div className="CardArea">
                {/* Create Card - Currently inactive per your request */}
                <CreateUserCard 
                    onClick={() => { console.log("Create user clicked") }} 
                />

                {/* 3. Mapping the HeavyDTOs to Cards */}
                {listUsers.map((user) => (
                    <UserCard
                        key={user.id}
                        user={user}
                        onClick={() => { setSelectedUser(user) }}
                    />
                ))}
            </div>

            {/* 4. Conditional Modal Rendering */}
            {selectedUser && (
                <UserDetailsModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </div>
    );
};