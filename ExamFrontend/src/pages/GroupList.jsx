import { useEffect, useState } from 'react';
import { getAllUserGroups, searchGroups } from "../api/api";
import { CreateGroupModal } from './CreateGroupModal';
import { GroupDetailsModal } from './GroupDetailsModal';

export const GroupList = () => {
    const [groups, setGroups] = useState([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(5);
    
    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    
    // State for the "Count-Enter" input field
    const [jumpPage, setJumpPage] = useState("1");

    // Central fetch function
    const fetchGroups = async (page = 0, query = searchQuery) => {
        try {
            let data;
            if (query.trim() !== "") {
                data = await searchGroups(query, page, pageSize);
            } else {
                data = await getAllUserGroups(page, pageSize);
            }
            
            setGroups(data.content || []);
            setTotalPages(data.totalPages || 0);
            setCurrentPage(page);
            setJumpPage((page + 1).toString());
        } catch (err) { 
            console.error("Failed to fetch groups:", err); 
        }
    };

    // DEBOUNCE LOGIC: Watch searchQuery and trigger fetch after 500ms
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchGroups(0, searchQuery);
        }, 500);

        // Cleanup: clear timeout if user types again before 500ms
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Just updates state now; the useEffect above handles the API call
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const clearSearch = () => {
        setSearchQuery("");
        // fetchGroups(0, "") is handled by the useEffect above automatically
    };

    const handleJumpPage = (e) => {
        if (e.key === 'Enter') {
            const pageNum = parseInt(jumpPage) - 1;
            if (!isNaN(pageNum) && pageNum >= 0 && pageNum < totalPages) {
                fetchGroups(pageNum);
            } else {
                setJumpPage((currentPage + 1).toString()); 
                setJumpPage((currentPage + 1).toString()); 
            }
        }
    };

    return (
        <div className="UserListOverall">
            <div className="AdminGroupSection">
                <div className="AdminGroupHeader">
                    <h2>Groups</h2>
                    
                    <div className="SearchContainer">
                        <input 
                            type="text" 
                            className="SearchInput" 
                            placeholder="Search groups..." 
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                        {searchQuery && (
                            <button className="SearchClearBtn" onClick={clearSearch}>
                                &times;
                            </button>
                        )}
                    </div>

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
                        {groups.length > 0 ? (
                            groups.map(group => (
                                <tr key={group.id}>
                                    <td>{group.name}</td>
                                    <td>
                                        <button className="ViewBtn" onClick={() => setSelectedGroup(group)}>
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="2" style={{textAlign: 'center', padding: '20px'}}>No groups found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

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