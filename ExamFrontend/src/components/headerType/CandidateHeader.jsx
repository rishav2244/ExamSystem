import { useContext, useState, useRef, useEffect } from "react";
import { AuthenticationContext } from "../../context/AuthenticationContext";
import { ResetPasswordModal } from "../../pages/ResetPasswordModal";
import { User } from "lucide-react";
export const CandidateHeader = () => {

    const { name, email, role, logout } =
        useContext(AuthenticationContext);

    const [showDropdown, setShowDropdown] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);

    const dropdownRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="admin-header">

            <h4 className="admin-header__welcome">
                Welcome, <span>{name}</span>
            </h4>

            <div className="profile-container" ref={dropdownRef}>
                 <div
                    className="profile-icon"
                    onClick={() => setShowDropdown(!showDropdown)}
                >
                    <User size={20} />
                </div>


                {showDropdown && (
                    <div className="profile-dropdown">

                        <p className="profile-name">
                            {name}
                        </p>

                        <p className="profile-role">
                            Role: {role}
                        </p>

                        <button
                            onClick={() =>
                                setShowResetModal(true)
                            }
                        >
                            Change Password
                        </button>

                        <button className="logout-btn" onClick={logout}>
                            Logout
                        </button>

                    </div>
                )}
            </div>

            {showResetModal && (
                <ResetPasswordModal
                    email={email}
                    onClose={() =>
                        setShowResetModal(false)
                    }
                />
            )}
        </header>
    );
};