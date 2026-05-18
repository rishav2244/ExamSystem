import { useContext, useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { AuthenticationContext } from "../../context/AuthenticationContext";
import { 
    User,
    FileText,
    Users,
    Layers,
    BarChart3,
    LogOut,
    ChevronUp,
    ChevronDown
} from "lucide-react";
import styles from "./css/AdminSidebar.module.css"

export const AdminSidebar = () => {
    const { name, role, logout } = useContext(AuthenticationContext);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <aside className={styles.sidebar}>
            {/* Top Branding / Welcome Section */}
            <div className={styles.sidebarBrand}>
                <h4 className={styles.welcomeText}>
                    Welcome, <span>{name}</span>
                </h4>
            </div>

            {/* Navigation Links with Icon + Text */}
            <nav className={styles.sidebarNav}>
                <NavLink 
                    to="/admin/exams" 
                    className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
                >
                    <FileText size={20} />
                    <span className={styles.navText}>Exams</span>
                </NavLink>

                <NavLink 
                    to="/admin/users" 
                    className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
                >
                    <Users size={20} />
                    <span className={styles.navText}>Users</span>
                </NavLink>

                <NavLink 
                    to="/admin/groups" 
                    className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
                >
                    <Layers size={20} />
                    <span className={styles.navText}>Groups</span>
                </NavLink>

                <NavLink 
                    to="/admin/submissions" 
                    className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
                >
                    <BarChart3 size={20} />
                    <span className={styles.navText}>Submissions</span>
                </NavLink>
            </nav>

            {/* Profile Dropup / Bottom Section */}
            <div className={styles.profileContainer} ref={dropdownRef}>
                <div
                    className={styles.profileToggle}
                    onClick={() => setShowDropdown(!showDropdown)}
                >
                    <div className={styles.profileInfoSummary}>
                        <div className={styles.profileIcon}>
                            <User size={20} />
                        </div>
                        <div className={styles.profileMetaText}>
                            <p className={styles.truncatedName}>{name}</p>
                            <p className={styles.roleText}>{role}</p>
                        </div>
                    </div>
                    {showDropdown ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </div>

                {showDropdown && (
                    <div className={styles.profileDropdown}>
                        <div className={styles.dropdownHeader}>
                            <p className={styles.profileName}>{name}</p>
                            <p className={styles.profileRole}>Role: {role}</p>
                        </div>
                        <hr className={styles.divider} />
                        <button className={styles.logoutBtn} onClick={logout}>
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
};