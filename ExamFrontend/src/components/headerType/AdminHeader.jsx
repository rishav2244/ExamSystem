// import { useContext, useState, useRef, useEffect } from "react";
// import { NavLink } from "react-router-dom";
// import { AuthenticationContext } from "../../context/AuthenticationContext";

// export const AdminHeader = () => {

//     const { name, role, logout } =
//         useContext(AuthenticationContext);

//     const [showDropdown, setShowDropdown] = useState(false);
//     const dropdownRef = useRef();

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (
//                 dropdownRef.current &&
//                 !dropdownRef.current.contains(event.target)
//             ) {
//                 setShowDropdown(false);
//             }
//         };

//         document.addEventListener("mousedown", handleClickOutside);
//         return () =>
//             document.removeEventListener("mousedown", handleClickOutside);
//     }, []);

//     return (
//         <header className="admin-header">

//             <h4 className="admin-header__welcome">
//                 Welcome, <span>{name}</span>
//             </h4>

//             <nav className="admin-header__nav">
//                 <NavLink to="/admin/exams" className="nav-item">
//                     Exams
//                 </NavLink>

//                 <NavLink to="/admin/users" className="nav-item">
//                     User List
//                 </NavLink>

//                 <NavLink to="/admin/groups" className="nav-item">
//                     Groups
//                 </NavLink>

//                 <NavLink to="/admin/submissions" className="nav-item">
//                     Submissions
//                 </NavLink>
//             </nav>

            
//             <div className="profile-container" ref={dropdownRef}>

//                 <div
//                     className="profile-icon"
//                     onClick={() =>
//                         setShowDropdown(!showDropdown)
//                     }
//                 >
//                     👤
//                 </div>

//                 {showDropdown && (
//                     <div className="profile-dropdown">

//                         <p className="profile-name">
//                             {name}
//                         </p>

//                         <p className="profile-role">
//                             Role: {role}
//                         </p>

//                         <button
//                             className="logout-btn"
//                             onClick={logout}
//                         >
//                             Logout
//                         </button>

//                     </div>
//                 )}
//             </div>

//         </header>
//     );
// };

import { useContext, useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { AuthenticationContext } from "../../context/AuthenticationContext";

// ✅ Icons
import {
    FileText,
    Users,
    Layers,
    BarChart3
} from "lucide-react";

export const AdminHeader = () => {

    const { name, role, logout } =
        useContext(AuthenticationContext);

    const [showDropdown, setShowDropdown] = useState(false);
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

            {/* ✅ ICON NAVBAR */}
            <nav className="admin-header__nav">

                <NavLink to="/admin/exams" className="nav-item">
                    <FileText size={18} />
                    <span className="tooltip">Exams</span>
                </NavLink>

                <NavLink to="/admin/users" className="nav-item">
                    <Users size={18} />
                    <span className="tooltip">Users</span>
                </NavLink>

                <NavLink to="/admin/groups" className="nav-item">
                    <Layers size={18} />
                    <span className="tooltip">Groups</span>
                </NavLink>

                <NavLink to="/admin/submissions" className="nav-item">
                    <BarChart3 size={18} />
                    <span className="tooltip">Submissions</span>
                </NavLink>

            </nav>

            {/* PROFILE */}
            <div className="profile-container" ref={dropdownRef}>

                <div
                    className="profile-icon"
                    onClick={() =>
                        setShowDropdown(!showDropdown)
                    }
                >
                    👤
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
                            className="logout-btn"
                            onClick={logout}
                        >
                            Logout
                        </button>

                    </div>
                )}
            </div>

        </header>
    );
};