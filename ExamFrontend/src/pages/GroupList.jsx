import { useEffect, useState } from 'react';
import { getAllUserGroups, deleteGroup } from "../api/api";
import { CreateGroupCard } from "../components/cardType/CreateGroupCard";
import { GroupCard } from "../components/cardType/GroupCard";
import { CreateGroupModal } from './CreateGroupModal';
import { GroupDetailsModal } from './GroupDetailsModal';

export const GroupList = () => {
    const [groups, setGroups] = useState([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);

    const fetchGroups = async () => {
        try {
            const data = await getAllUserGroups();
            setGroups(data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchGroups(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this group?")) {
            await deleteGroup(id);
            fetchGroups();
        }
    };

    return (
        <div className="UserListOverall">
            {/* <div className="CardArea">
                <CreateGroupCard onClick={() => setIsCreateOpen(true)} />

                {groups.map(group => (
                    <GroupCard
                        key={group.id}
                        group={group}
                        onClick={(g) => setSelectedGroup(g)} // Set group to open modal
                        onDelete={handleDelete}
                    />
                ))}
            </div> */}
            <div className="AdminGroupSection">

                <div className="AdminGroupHeader">
                    <h2>Groups</h2>

                    <button
                        className="CreateGroupBtn"
                        onClick={() => setIsCreateOpen(true)}
                    >
                        + Create Group
                    </button>
                </div>

                <table className="GroupTable">
                    <thead>
                        <tr>
                            <th>Group Name</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {groups.map(group => (
                            <tr key={group.id}>
                                <td>{group.name}</td>
                                <td>
                                    <button
                                        className="ViewBtn"
                                        onClick={() => setSelectedGroup(group)}
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>


            {isCreateOpen && (
                <CreateGroupModal
                    onClose={() => setIsCreateOpen(false)}
                    onGroupCreated={fetchGroups}
                />
            )}

            {selectedGroup && (
                <GroupDetailsModal
                    group={selectedGroup}
                    onClose={() => setSelectedGroup(null)}
                    onGroupDeleted={fetchGroups}
                />
            )}
        </div>
    );
};