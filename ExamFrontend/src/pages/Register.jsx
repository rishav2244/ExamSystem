import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerCandidate } from "../api/api";
import "../App.css";

export const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            await registerCandidate(name, email, password);

            setMessage("Registration successful! You can now login.");

            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (err) {
            setMessage(
                err.response?.data?.message ||
                err.response?.data ||
                "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Candidate Registration</h2>

                <form onSubmit={handleRegister}>

                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

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

                    <button type="submit" disabled={loading}>
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                {message && <p className="auth-message">{message}</p>}

                <p className="switch-auth">
                    Already have an account?{" "}
                    <span onClick={() => navigate("/login")}>
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
};