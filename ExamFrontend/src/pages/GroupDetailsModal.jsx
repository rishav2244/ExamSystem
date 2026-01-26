import { useEffect, useState } from 'react';
import { getGroupMembers, deleteGroup } from '../api/api';

export const GroupDetailsModal = ({ group, onClose, onGroupDeleted }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (group?.id) {
            getGroupMembers(group.id)
                .then((data) => {
                    setMembers(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Error fetching members:", err);
                    setLoading(false);
                });
        }
    }, [group]);

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
                    <p className="subtitle">Group Members</p>
                </div>

                <div className="selection-list-container">
                    {loading ? (
                        <p className="loading-text">Loading members...</p>
                    ) : members.length > 0 ? (
                        members.map(member => (
                            <div key={member.id} className="selection-item detail-view">
                                <div className="selection-info">
                                    <span className="selection-name">{member.name}</span>
                                    <span className="selection-email">{member.email}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="empty-text">No members in this group.</p>
                    )}
                </div>

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