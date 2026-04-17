import { useState, useEffect, useCallback } from 'react';
import { getCandidatesOnly, searchCandidates } from '../../api/api';

export const ManualMemberSelector = ({ onSelectionChange }) => {
    const [pageData, setPageData] = useState({ content: [], totalPages: 0 });
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchPage = useCallback(async (page, query) => {
        try {
            let data;
            if (query.trim()) {
                data = await searchCandidates(query, page, 5);
            } else {
                data = await getCandidatesOnly(page, 5);
            }
            setPageData(data);
        } catch (err) {
            console.error("Selector fetch error:", err);
        }
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            setCurrentPage(0);
            fetchPage(0, searchQuery);
        }, 500); // 500ms debounce

        return () => clearTimeout(handler);
    }, [searchQuery, fetchPage]);

    useEffect(() => {
        fetchPage(currentPage, searchQuery);
    }, [currentPage, fetchPage]);

    const toggleUser = (user) => {
        const isSelected = selectedUsers.some(u => u.id === user.id);
        let updatedSelection;

        if (isSelected) {
            updatedSelection = selectedUsers.filter(u => u.id !== user.id);
        } else {
            updatedSelection = [...selectedUsers, { id: user.id, email: user.email }];
        }

        setSelectedUsers(updatedSelection);
        onSelectionChange(updatedSelection.map(u => u.email));
    };

    const clearAll = () => {
        setSelectedUsers([]);
        onSelectionChange([]);
    };

    const isUserSelected = (userId) => selectedUsers.some(u => u.id === userId);

    return (
        <div className="manual-selector-wrapper">
            <div className="selector-header-actions">
                <div className="SearchContainer">
                    <input
                        type="text"
                        className="SearchInput"
                        placeholder="Search candidates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button 
                            className="SearchClearBtn" 
                            onClick={() => setSearchQuery('')}
                            type="button"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="selection-stats">
                    <span className="selection-counter">
                        Selected: <strong>{selectedUsers.length}</strong>
                    </span>
                    {selectedUsers.length > 0 && (
                        <button type="button" className="clear-selection-btn" onClick={clearAll}>
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            <div className="selection-list-container">
                {pageData.content && pageData.content.length > 0 ? (
                    pageData.content.map(user => (
                        <div
                            key={user.id}
                            className={`selection-item ${isUserSelected(user.id) ? 'selected' : ''}`}
                            onClick={() => toggleUser(user)}
                        >
                            <input
                                type="checkbox"
                                className="selection-checkbox"
                                checked={isUserSelected(user.id)}
                                readOnly
                            />
                            <div className="selection-info">
                                <span className="selection-name">{user.name}</span>
                                <span className="selection-email">{user.email}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-candidates-msg">No candidates found.</div>
                )}
            </div>

            <div className="SelectorPagination">
                <button
                    type="button"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                >
                    &larr; Prev
                </button>
                <span className="page-indicator">
                    {currentPage + 1} / {pageData.totalPages || 1}
                </span>
                <button
                    type="button"
                    disabled={currentPage >= (pageData.totalPages || 1) - 1}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                >
                    Next &rarr;
                </button>
            </div>
        </div>
    );
};