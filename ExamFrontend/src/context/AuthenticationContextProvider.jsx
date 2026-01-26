import { AuthenticationContext } from "./AuthenticationContext"
import { useEffect, useState } from "react"

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
            setName(parsed.name);
            setEmail(parsed.email);
            setRole(parsed.role);
            setIsLoggedIn(true);
            setToken(parsed.token);
        }
    }, []);

    const login = (userData) => {
        setToken(userData.token);
        setName(userData.name);
        setEmail(userData.email);
        setRole(userData.role);
        setIsLoggedIn(true);
        sessionStorage.setItem(
            "auth",
            JSON.stringify({ name: userData.name, email: userData.email, role: userData.role, token: userData.token })
        );
    };

    const logout = () => {
        setToken(null);
        setName(null);
        setEmail(null);
        setRole(null);
        setIsLoggedIn(false);
        sessionStorage.removeItem("auth");
    }

    return (
        <AuthenticationContext.Provider
            value={{ login, logout, isLoggedIn, name, role, email, token }}>
            {children}
        </AuthenticationContext.Provider>
    )
}
