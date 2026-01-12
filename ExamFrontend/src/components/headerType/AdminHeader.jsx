import { useContext } from "react"
import { AuthenticationContext } from "../../context/AuthenticationContext"

export const AdminHeader = () => {
    const { name, logout } = useContext(AuthenticationContext);

    const handleLogout = (e) => {
        logout();
    };

    return (
        <div
            className="adminHeader">
                <h4>Welcome, {name}</h4>
                <button
                onClick={handleLogout}>Log out</button>
        </div>
    )
}
