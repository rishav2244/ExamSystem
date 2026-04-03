import { useEffect, useState, useCallback, useRef } from 'react';
import { getGroupMembers, searchGroupMembers, deleteGroup } from '../api/api';

export const GroupDetailsModal = ({ group, onClose, onGroupDeleted }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [jumpPage, setJumpPage] = useState("1");
    const [pageSize] = useState(5);

    // This ref helps us track if the component is mounting for the first time
    const isFirstRun = useRef(true);

    const fetchMembers = useCallback(async (page = 0, query = "") => {
        setLoading(true);
        try {
            let data;
            if (query.trim()) {
                data = await searchGroupMembers(group.id, query, page, pageSize);
            } else {
                data = await getGroupMembers(group.id, page, pageSize);
            }

            setMembers(data.content || []);
            setTotalPages(data.totalPages || 0);
            setCurrentPage(page);
            setJumpPage((page + 1).toString());
        } catch (err) {
            console.error("Error fetching members:", err);
            setMembers([]);
        } finally {
            setLoading(false);
        }
    }, [group.id, pageSize]);

    // EFFECT 1: Handle Initial Load and Debounced Search
    useEffect(() => {
        // Skip the very first run to avoid double-fetching on mount 
        // since Effect 2 handles the initial 0-page load
        if (isFirstRun.current) {
            isFirstRun.current = false;
            fetchMembers(0, "");
            return;
        }

        const handler = setTimeout(() => {
            fetchMembers(0, searchTerm);
        }, 500); // 500ms delay

        return () => clearTimeout(handler); // Cleanup: cancels the timer if user types again
    }, [searchTerm, fetchMembers]);

    // Simplified handleSearch - only updates the state
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleJumpPage = (e) => {
        if (e.key === 'Enter') {
            const pageNum = parseInt(jumpPage) - 1;
            if (!isNaN(pageNum) && pageNum >= 0 && pageNum < totalPages) {
                // For direct jumps, we don't debounce, we just fire
                fetchMembers(pageNum, searchTerm);
            } else {
                setJumpPage((currentPage + 1).toString());
            }
        }
    };

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete "${group.name}"?`)) {
            try {
                await deleteGroup(group.id);
                onGroupDeleted(); 
                onClose(); 
            } catch (err) {
                alert("Failed to delete group.");
            }
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-window" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                
                <div className="modal-header">
                    <h2>{group.name}</h2>
                    <p className="subtitle">Manage Group Members</p>
                    
                    <div className="SearchContainer" style={{marginTop: '15px'}}>
                        <input 
                            type="text"
                            className="SearchInput"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        {searchTerm && (
                            <button 
                                className="SearchClearBtn" 
                                onClick={() => setSearchTerm("")}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                <div className="selection-list-container" style={{ minHeight: '300px', position: 'relative' }}>
                    {loading && <div className="loading-overlay">Updating...</div>}
                    
                    {!loading && members.length > 0 ? (
                        members.map(member => (
                            <div key={member.id} className="selection-item detail-view">
                                <div className="selection-info">
                                    <span className="selection-name">{member.name}</span>
                                    <span className="selection-email">{member.email}</span>
                                </div>
                            </div>
                        ))
                    ) : !loading && (
                        <p className="empty-text">No members found matching your search.</p>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="GrpList-Pagination-Container">
                        <button 
                            className="GrpList-Pagination-Nav"
                            onClick={() => fetchMembers(currentPage - 1, searchTerm)}
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
                            onClick={() => fetchMembers(currentPage + 1, searchTerm)}
                            disabled={currentPage === totalPages - 1}
                        >
                            &raquo;
                        </button>
                    </div>
                )}

                <div className="modal-footer">
                    <button className="delete-button-secondary" onClick={handleDelete}>
                        Delete Group
                    </button>
                    <button className="CloseButtonSecondary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};