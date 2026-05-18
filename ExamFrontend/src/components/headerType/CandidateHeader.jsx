import { useContext, useState } from "react";
import { AuthenticationContext } from "../../context/AuthenticationContext";
import { ResetPasswordModal } from "../../pages/ResetPasswordModal";
import { useNavigate, useLocation } from "react-router-dom";
import { User, KeyRound, LogOut, Award, LayoutDashboard } from "lucide-react";
import brandLogo from "../../assets/Exavalu.png"; // Integrating corporate logo
import styles from "./css/CandidateHeader.module.css";

export const CandidateHeader = () => {
    const { name, email, role, logout } = useContext(AuthenticationContext);
    const [showResetModal, setShowResetModal] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();

    // Active state tracking utilities
    const isDashboardActive = location.pathname === "/candidate" || location.pathname === "/candidate/dashboard";
    const isResultsActive = location.pathname === "/candidate/results";

    return (
        <header className={styles.headerContainer}>
            {/* Top Navigation & Profile Links Area */}
            <div className={styles.topNavigationBlock}>
                
                {/* Brand Logo Wrapper */}
                <div className={styles.brandWrapper}>
                    <img 
                        src={brandLogo} 
                        alt="Company Logo" 
                        className={styles.logoImage} 
                    />
                </div>

                {/* Clean Typography Identity Greeting */}
                <div className={styles.identitySection}>
                    <div className={styles.avatarIcon}>
                        <User size={18} />
                    </div>
                    <div className={styles.metaText}>
                        <h4 className={styles.welcomeMessage}>Welcome, <span>{name}</span></h4>
                        <p className={styles.roleLabel}>{role}</p>
                    </div>
                </div>

                {/* Main Sidebar Links Stack */}
                <nav className={styles.navStack}>
                    <button 
                        className={`${styles.navLink} ${isDashboardActive ? styles.active : ''}`}
                        onClick={() => navigate("/candidate/dashboard")}
                    >
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </button>

                    <button 
                        className={`${styles.navLink} ${isResultsActive ? styles.active : ''}`}
                        onClick={() => navigate("/candidate/results")}
                    >
                        <Award size={18} />
                        <span>View Results</span>
                    </button>

                    <button 
                        className={styles.navLink}
                        onClick={() => setShowResetModal(true)}
                    >
                        <KeyRound size={18} />
                        <span>Change Password</span>
                    </button>
                </nav>
            </div>

            {/* Bottom Stationary Sticky Section */}
            <div className={styles.bottomStickyBlock}>
                <button className={styles.logoutBtn} onClick={logout}>
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>

            {showResetModal && (
                <ResetPasswordModal
                    email={email}
                    onClose={() => setShowResetModal(false)}
                />
            )}
        </header>
    );
};