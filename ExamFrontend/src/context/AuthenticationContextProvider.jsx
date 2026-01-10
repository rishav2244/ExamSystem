import { AuthenticationContext } from "./AuthenticationContext"
import { useEffect, useState } from "react"

export const AuthenticationContextProvider = ({ children }) => {
    const [name, setName] = useState(null);
    const [email, setEmail] = useState(null);
    const [role, setRole] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const storedAuth = sessionStorage.getItem("auth");
        if (storedAuth) {
            const parsed = JSON.parse(storedAuth);
            setName(parsed.name);
            setEmail(parsed.email);
            setRole(parsed.role);
            setIsLoggedIn(true);
        }
    }, []);

    const login = (userData) => {
        setName(userData.name);
        setEmail(userData.email);
        setRole(userData.role);
        setIsLoggedIn(true);
        sessionStorage.setItem(
            "auth",
            JSON.stringify({ name: userData.name, email: userData.email, role: userData.role })
        );
    };

    const logout = () => {
        setName(null);
        setEmail(null);
        setRole(null);
        setIsLoggedIn(false);
        sessionStorage.removeItem("auth");
    }

    return (
        <AuthenticationContext.Provider
            value={{ login, logout, isLoggedIn, name, role, email }}>
            {children}
        </AuthenticationContext.Provider>
    )
}
