import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

import { loginAttempt } from "../api/api";
import { AuthenticationContext } from "../context/AuthenticationContext";

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const { login } = useContext(AuthenticationContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const userData = await loginAttempt(email, password);
            login(userData);

            if (userData.role === "ADMIN") {
                navigate("/admin");
            } else {
                navigate("/user");
            }
        } catch (err) {
            const errorMsg =
                err.response?.data?.message || "Login failed. Try again.";
            setMessage(errorMsg);
        }
    };

    return (
        <div className="login-card">
            <h2>Exam Portal Login</h2>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            <button onClick={handleLogin}>Login</button>

            {message && <p>{message}</p>}
        </div>
    );
};
