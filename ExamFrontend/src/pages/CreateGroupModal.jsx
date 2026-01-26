import { useState, useEffect, useContext } from 'react';
import { getCandidatesOnly, createGroup } from '../api/api';
import { AuthenticationContext } from '../context/AuthenticationContext';

export const CreateGroupModal = ({ onClose, onGroupCreated }) => {
    const { email: creatorMail } = useContext(AuthenticationContext);
    const [groupName, setGroupName] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);

    useEffect(() => {
        getCandidatesOnly().then(setCandidates).catch(console.error);
    }, []);

    const toggleUser = (userId) => {
        setSelectedUserIds(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedUserIds.length === 0) return alert("Select at least one member");

        const selectedEmails = candidates
            .filter(user => selectedUserIds.includes(user.id))
            .map(user => user.email);

        try {
            await createGroup({
                groupName,
                creatorMail,
                groupMembers: selectedEmails
            });
            onGroupCreated();
            onClose();
        } catch (err) {
            console.error("Creation Error:", err);
            alert("Failed to create group.");
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-window" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <h2>New Group</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Group Name</label>
                        <input
                            type="text"
                            required
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                            placeholder="e.g. Morning Shift"
                        />
                    </div>

                    <label>Select Candidates</label>
                    <div className="selection-list-container">
                        {candidates.map(user => (
                            <div key={user.id} className="selection-item" onClick={() => toggleUser(user.id)}>
                                <input
                                    type="checkbox"
                                    className="selection-checkbox"
                                    checked={selectedUserIds.includes(user.id)}
                                    readOnly
                                />
                                <div className="selection-info">
                                    <span className="selection-name">{user.name}</span>
                                    <span className="selection-email">{user.email}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="CloseButtonSecondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="form-submit">Save Group</button>
                    </div>
                </form>
            </div>
        </div>
    );
};