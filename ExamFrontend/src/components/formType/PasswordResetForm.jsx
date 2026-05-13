import styles from "../../pages/css/ForgotPassword.module.css";

export const PasswordResetForm = ({ 
    email, otp, setOtp, newPassword, setNewPassword, 
    confirmPassword, setConfirmPassword, onSubmit, loading, attemptsLeft 
}) => (
    <form onSubmit={onSubmit}>
        <p className={styles.stepInfo}>Code sent to <b>{email}</b></p>
        <input
            type="text"
            className={styles.input}
            placeholder="6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
        />
        <input
            type="password"
            className={styles.input}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
        />
        <input
            type="password"
            className={styles.input}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
        />
        <button 
            type="submit" 
            className={styles.authBtn} 
            disabled={loading || attemptsLeft === 0}
        >
            {loading ? "Resetting..." : "Reset Password"}
        </button>
    </form>
);