import React from 'react';

export const UserDetailsModal = ({ user, onClose }) => {
    if (!user) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-window" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>

                <h2 style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
                    User Profile
                </h2>

                <div className="user-details-container">
                    <div className="user-info-row">
                        <label>User ID</label>
                        <p>{user.id}</p>
                    </div>

                    <div className="user-info-row">
                        <label>Full Name</label>
                        <p>{user.name}</p>
                    </div>

                    <div className="user-info-row">
                        <label>Email Address</label>
                        <p>{user.email}</p>
                    </div>

                    <div className="user-info-row">
                        <label>Role</label>
                        <div className={`role-badge ${user.role}`}>
                            {user.role}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button 
                        className="DeleteUserButton"
                        onClick={() => {
                            if(window.confirm("Delete this user?")) {
                                console.log("Deleting user:", user.id);
                            }
                        }}
                    >
                        Delete User
                    </button>
                    
                    <button 
                        className="form-submit" 
                        style={{ margin: 0 }} 
                        onClick={onClose}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};