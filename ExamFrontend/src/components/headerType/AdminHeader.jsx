import { useContext } from "react"
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
            <button
                className="admin-header__logout"
                onClick={handleLogout}
            >
                Log out
            </button>
        </header>
    )
}
