import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestForgotPassword, verifyAndResetPassword } from "../api/api";
import { EmailEntryForm } from "../components/formType/EmailEntryForm";
import { PasswordResetForm } from "../components/formType/PasswordResetForm";
import styles from "./css/ForgotPassword.module.css";

export const ForgotPassword = () => {
    const navigate = useNavigate();

    // State Management
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [attemptsLeft, setAttemptsLeft] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const loginRedirectTime = 3000;

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        try {
            await requestForgotPassword(email);
            setStep(2);
            setMessage("If an account exists, a reset code has been sent.");
        } catch (err) {
            setMessage(err.response?.data || "Failed to initiate reset.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        setLoading(true);
        setMessage("");
        try {
            const data = await verifyAndResetPassword(email, otp, newPassword);

            if (data.success) {
                setMessage("Password reset successful! Redirecting to login...");
                setTimeout(() => navigate("/login"), loginRedirectTime);
            } else {
                setAttemptsLeft(data.attemptsLeft);
                setMessage(`Invalid code. ${data.attemptsLeft} attempts remaining.`);
            }
        } catch (err) {
            const errorMsg = err.response?.data || "Reset failed.";
            setMessage(errorMsg);

            // Handle account lockout scenario
            if (err.response?.status === 400 &&
                (errorMsg.toLowerCase().includes("locked") || errorMsg.toLowerCase().includes("limit"))) {
                setAttemptsLeft(0);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <h2>{step === 1 ? "Forgot Password" : "Reset Password"}</h2>

                {step === 1 ? (
                    <EmailEntryForm
                        email={email}
                        setEmail={setEmail}
                        onSubmit={handleRequestOtp}
                        loading={loading}
                    />
                ) : (
                    <PasswordResetForm
                        email={email}
                        otp={otp} setOtp={setOtp}
                        newPassword={newPassword} setNewPassword={setNewPassword}
                        confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
                        onSubmit={handleResetPassword}
                        loading={loading}
                        attemptsLeft={attemptsLeft}
                    />
                )}

                {message && (
                    <p className={`${styles.authMessage} ${attemptsLeft === 0 ? styles.errorText : ""}`}>
                        {message}
                    </p>
                )}
                <p className={styles.switchAuth}>
                    <span onClick={() => navigate("/login")} className={styles.link}>
                        Back to Login
                    </span>
                </p>
            </div>
        </div>
    );
};