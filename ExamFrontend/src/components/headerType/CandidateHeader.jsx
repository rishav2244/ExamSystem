import { useContext, useState } from "react";
import { AuthenticationContext } from "../../context/AuthenticationContext";
import { ResetPasswordModal } from "../../pages/ResetPasswordModal";

export const CandidateHeader = () => {
    const { name, email, logout } = useContext(AuthenticationContext);
    const [showResetModal, setShowResetModal] = useState(false);

    return (
        <header className="admin-header">
            <h4 className="admin-header__welcome">
                Welcome, <span>{name}</span>
            </h4>

            <div className="admin-header__nav">
                <button 
                    className="admin-header__link"
                    onClick={() => setShowResetModal(true)}
                    style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
                >
                    Change Password
                </button>
            </div>

            <button className="admin-header__logout" onClick={logout}>
                Log out
            </button>

            {showResetModal && (
                <ResetPasswordModal 
                    email={email} 
                    onClose={() => setShowResetModal(false)} 
                />
            )}
        </header>
    );
};