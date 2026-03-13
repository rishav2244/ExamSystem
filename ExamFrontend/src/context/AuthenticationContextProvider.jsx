import { AuthenticationContext } from "./AuthenticationContext"
import { useEffect, useState } from "react"
import { logout as logoutApi} from "../api/api";

export const AuthenticationContextProvider = ({ children }) => {
    const [name, setName] = useState(null);
    const [email, setEmail] = useState(null);
    const [role, setRole] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const storedAuth = sessionStorage.getItem("auth");
        if (storedAuth) {
            const parsed = JSON.parse(storedAuth);
            const userData = parsed.user || parsed;

            setName(userData.name);
            setEmail(userData.email);
            setRole(userData.role);
            setToken(parsed.token);
            setIsLoggedIn(true);
        }
    }, []);

    const login = (data) => {
        const formattedToken = `${data.tokens.type} ${data.tokens.accessToken}`;

        setToken(formattedToken);
        setName(data.user.name);
        setEmail(data.user.email);
        setRole(data.user.role);
        setIsLoggedIn(true);
    };

    const logout = async () => {
        try {
            await logoutApi();
        } catch (err) {
            console.error("Server-side logout failed", err);
        } finally {
            setToken(null);
            setName(null);
            setEmail(null);
            setRole(null);
            setIsLoggedIn(false);
            sessionStorage.removeItem("auth");
            window.location.href = "/login";
        }
    };

    return (
        <AuthenticationContext.Provider
            value={{ login, logout, isLoggedIn, name, role, email, token }}>
            {children}
        </AuthenticationContext.Provider>
    );
};