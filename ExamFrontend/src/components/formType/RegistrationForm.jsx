import { useState } from "react";
import styles from "./RegistrationForm.module.css";

export const RegistrationForm = ({ name, setName, email, setEmail, password, setPassword, onSubmit, loading }) => {

    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordMatch, setPasswordMatch] = useState(true);

    const handleFormSubmit = (e) => {
        e.preventDefault();

        if (password === confirmPassword) {
            setPasswordMatch(true);
            onSubmit();
        } else {
            setPasswordMatch(false);
        }
    };

    return (
        <form onSubmit={handleFormSubmit}>
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
            <input
                type="password"
                placeholder="Re-type password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            />
            {!passwordMatch && (
                <p className={styles.PwMismatchWarning}>
                    Passwords do not match.
                </p>
            )}
            <button type="submit" disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP"}
            </button>
        </form>
    );
};