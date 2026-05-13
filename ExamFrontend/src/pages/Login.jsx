import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { loginAttempt } from "../api/api";
import { AuthenticationContext } from "../context/AuthenticationContext";

import styles from "./css/Login.module.css"

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const { login } = useContext(AuthenticationContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const data = await loginAttempt(email, password);
            login(data);

            if (data.user && data.user.role === "ADMIN") {
                navigate("/admin");
            } else {
                navigate("/candidate");
            }
        } catch (err) {
            const errorMsg =
                err.response?.data?.message || "Login failed. Try again.";
            setMessage(errorMsg);
        }
    };

    return (
        <div className={styles.loginCard}>
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

            <p className="switch-auth">
                Don't have an account?{" "}
                <span onClick={() => navigate("/register")}>
                    Register here
                </span>
            </p>

            <p className="switch-auth">
                <span onClick={() => navigate("/forgot")}>
                    Forgot password?
                </span>
            </p>
            {message && <p>{message}</p>}
        </div>
    );
};
