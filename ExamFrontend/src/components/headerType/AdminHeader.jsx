import { useContext } from "react"
import { NavLink } from "react-router-dom";
import { AuthenticationContext } from "../../context/AuthenticationContext"

export const AdminHeader = () => {
    const { name, logout } = useContext(AuthenticationContext);

    const handleLogout = (e) => {
        logout();
    };

    return (
        <header className="admin-header">

            <h4 className="admin-header__welcome">
                Welcome, <span>{name}</span>
            </h4>

            <nav className="admin-header__nav">
                <NavLink
                    to="/admin/exams"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    Exams
                </NavLink>
                <NavLink
                    to="/admin/users"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    User List
                </NavLink>
            </nav>


            <button
                className="admin-header__logout"
                onClick={handleLogout}
            >
                Log out
            </button>
        </header>
    );
}
