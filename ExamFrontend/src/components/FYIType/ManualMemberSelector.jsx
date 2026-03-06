import { useState, useEffect } from 'react';
import { getCandidatesOnly } from '../../api/api';

export const ManualMemberSelector = ({ onSelectionChange }) => {
    const [candidates, setCandidates] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        getCandidatesOnly().then(setCandidates).catch(console.error);
    }, []);

    const toggleUser = (user) => {
        let updatedIds;
        if (selectedIds.includes(user.id)) {
            updatedIds = selectedIds.filter(id => id !== user.id);
        } else {
            updatedIds = [...selectedIds, user.id];
        }
        
        setSelectedIds(updatedIds);
        
        const selectedEmails = candidates
            .filter(c => updatedIds.includes(c.id))
            .map(c => c.email);
        onSelectionChange(selectedEmails);
    };

    return (
        <div className="selection-list-container">
            {candidates.map(user => (
                <div 
                    key={user.id} 
                    className={`selection-item ${selectedIds.includes(user.id) ? 'selected' : ''}`} 
                    onClick={() => toggleUser(user)}
                >
                    <input
                        type="checkbox"
                        className="selection-checkbox"
                        checked={selectedIds.includes(user.id)}
                        readOnly
                    />
                    <div className="selection-info">
                        <span className="selection-name">{user.name}</span>
                        <span className="selection-email">{user.email}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};