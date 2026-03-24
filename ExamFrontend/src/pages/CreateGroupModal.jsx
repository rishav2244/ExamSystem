import { useState, useContext } from 'react';
import { createGroup } from '../api/api';
import { AuthenticationContext } from '../context/AuthenticationContext';
import { ManualMemberSelector } from '../components/FYIType/ManualMemberSelector';
import { CSVMemberUploader } from '../components/uploadType/CSVMemberUploader';
import { StatusPopup } from '../components/popupType/StatusPopup';

export const CreateGroupModal = ({ onClose, onGroupCreated }) => {
    const { email: creatorMail } = useContext(AuthenticationContext);
    const [groupName, setGroupName] = useState('');
    const [activeTab, setActiveTab] = useState('manual');
    const [selectedEmails, setSelectedEmails] = useState([]);
    const [popup, setPopup] = useState({ show: false, message: '', type: '', data: null });

    const showReport = (message, type = 'info', data = null) => {
        setPopup({ show: true, message, type, data });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!groupName.trim()) return showReport("Please enter a group name.", 'error');
        if (selectedEmails.length === 0) return showReport("No valid members selected.", 'error');

        try {
            console.log("Submitting Group Request for:", groupName);
            const response = await createGroup({
                groupName,
                creatorMail,
                groupMembers: selectedEmails
            });

            console.log("Full Backend Response:", response);
            console.log("Failed Users Array:", response.failedUsers);

            if (response.failedUsers && response.failedUsers.length > 0) {
                showReport(
                    `Group created with ${response.totalAdded} members. Some users were skipped.`,
                    'warning',
                    response.failedUsers
                );
                onGroupCreated();
            } else {
                onGroupCreated();
                onClose();
            }
        } catch (err) {
            console.error("API Error Object:", err);
            showReport("Failed to create group. Check if the group name is unique.", 'error');
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-window" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <h2 className="grp-modal-title">Create New Group</h2>

                <form onSubmit={handleSubmit}>
                    <div className="grp-form-group">
                        <label className="grp-field-label">Group Name</label>
                        <input
                            type="text"
                            className="grp-text-input"
                            required
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                            placeholder="e.g. Senior Developers 2026"
                        />
                    </div>

                    <div className="grp-tab-container">
                        <button
                            type="button"
                            className={`grp-tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
                            onClick={() => setActiveTab('manual')}
                        >
                            Select Manually
                        </button>
                        <button
                            type="button"
                            className={`grp-tab-btn ${activeTab === 'csv' ? 'active' : ''}`}
                            onClick={() => setActiveTab('csv')}
                        >
                            Upload CSV
                        </button>
                    </div>

                    <div className="grp-tab-content">
                        {activeTab === 'manual' ? (
                            <ManualMemberSelector onSelectionChange={setSelectedEmails} />
                        ) : (
                            <CSVMemberUploader 
                                onEmailsParsed={setSelectedEmails}
                                onError={(msg) => showReport(msg, 'error')}
                            />
                        )}
                    </div>

                    <div className="grp-modal-footer">
                        <span className="grp-member-count">
                            Members identified: <strong>{selectedEmails.length}</strong>
                        </span>
                        <div className="grp-footer-btns">
                            <button type="button" className="grp-secondary-btn" onClick={onClose}>Cancel</button>
                            <button type="submit" className="grp-primary-submit">Save Group</button>
                        </div>
                    </div>
                </form>

                {popup.show && (
                    <StatusPopup
                        message={popup.message}
                        type={popup.type}
                        data={popup.data}
                        onClose={() => {
                            setPopup({ ...popup, show: false });
                            if (popup.type === 'warning') onClose();
                        }}
                    />
                )}
            </div>
        </div>
    );
};