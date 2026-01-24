import { useEffect, useState } from 'react';
import { CreateUserCard } from "../components/cardType/CreateUserCard";
import { UserCard } from "../components/cardType/UserCard";
import { UserDetailsModal } from "./UserDetailsModal";
import { getAllUsers } from "../api/api";

export const UserList = () => {
    const [listUsers, setListUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUsers = async () => {
        try {
            const users = await getAllUsers();
            setListUsers(users);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="UserListOverall">
            <div className="CardArea">
                <CreateUserCard
                    onClick={() => console.log("Create user clicked")}
                />

                {listUsers.map((user) => (
                    <UserCard
                        key={user.id}
                        user={user}
                        onClick={(user) => setSelectedUser(user)}
                    />
                ))}
            </div>

            {selectedUser && (
                <UserDetailsModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </div>
    );
};