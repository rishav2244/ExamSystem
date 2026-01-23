export const UserDetailsModal = ({ user, onClose }) => {
    // Basic check to ensure user data exists
    if (!user) return null;

    return (
        <div className="ModalBackdrop" onClick={onClose}>
            <div className="ModalContainer" onClick={(e) => e.stopPropagation()}>
                <div className="ModalHeader">
                    <h2>User Information</h2>
                    <button className="CloseBtn" onClick={onClose}>X</button>
                </div>
                
                <div className="ModalBody">
                    <p><strong>Database ID:</strong> {user.id}</p>
                    <p><strong>Full Name:</strong> {user.name}</p>
                    <p><strong>Email Address:</strong> {user.email}</p>
                    <p><strong>System Role:</strong> {user.role}</p>
                </div>
            </div>
        </div>
    );
};