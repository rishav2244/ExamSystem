import { useEffect, useState } from 'react';
import { getAllUserGroups } from "../api/api";
import { CreateGroupModal } from './CreateGroupModal';
import { GroupDetailsModal } from './GroupDetailsModal';

export const GroupList = () => {
    const [groups, setGroups] = useState([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(5);
    
    // State for the "Count-Enter" input field
    const [jumpPage, setJumpPage] = useState("1");

    const fetchGroups = async (page = 0) => {
        try {
            const data = await getAllUserGroups(page, pageSize);
            setGroups(data.content || []);
            setTotalPages(data.totalPages || 0);
            setCurrentPage(page);
            setJumpPage((page + 1).toString()); // Sync input with actual page
        } catch (err) { 
            console.error("Failed to fetch groups:", err); 
        }
    };

    useEffect(() => { fetchGroups(0); }, []);

    // Handles the "Enter" key on the page input
    const handleJumpPage = (e) => {
        if (e.key === 'Enter') {
            const pageNum = parseInt(jumpPage) - 1;
            if (!isNaN(pageNum) && pageNum >= 0 && pageNum < totalPages) {
                fetchGroups(pageNum);
            } else {
                setJumpPage((currentPage + 1).toString()); // Reset on invalid
            }
        }
    };

    return (
        <div className="UserListOverall">
            <div className="AdminGroupSection">
                <div className="AdminGroupHeader">
                    <h2>Groups</h2>
                    <button className="CreateGroupBtn" onClick={() => setIsCreateOpen(true)}>
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
                                    <button className="ViewBtn" onClick={() => setSelectedGroup(group)}>
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Count-Enter Pagination Controls */}
                {totalPages > 0 && (
                    <div className="GrpList-Pagination-Container">
                        <button 
                            className="GrpList-Pagination-Nav"
                            onClick={() => fetchGroups(currentPage - 1)}
                            disabled={currentPage === 0}
                        >
                            &laquo;
                        </button>

                        <div className="GrpList-Jump-Container">
                            <span>Page</span>
                            <input 
                                type="text"
                                className="GrpList-Jump-Input"
                                value={jumpPage}
                                onChange={(e) => setJumpPage(e.target.value)}
                                onKeyDown={handleJumpPage}
                            />
                            <span>of {totalPages}</span>
                        </div>

                        <button 
                            className="GrpList-Pagination-Nav"
                            onClick={() => fetchGroups(currentPage + 1)}
                            disabled={currentPage === totalPages - 1}
                        >
                            &raquo;
                        </button>
                    </div>
                )}
            </div>

            {isCreateOpen && (
                <CreateGroupModal onClose={() => setIsCreateOpen(false)} onGroupCreated={() => fetchGroups(0)} />
            )}

            {selectedGroup && (
                <GroupDetailsModal group={selectedGroup} onClose={() => setSelectedGroup(null)} onGroupDeleted={() => fetchGroups(0)} />
            )}
        </div>
    );
};