import styles from "../../pages/css/ForgotPassword.module.css";

export const PasswordResetForm = ({ 
    email, otp, setOtp, newPassword, setNewPassword, 
    confirmPassword, setConfirmPassword, onSubmit, onResend, 
    resendTimer, loading, attemptsLeft 
}) => (
    <form className={styles.form} onSubmit={onSubmit}>
        <p className={styles.stepInfo}>Code sent to <b>{email}</b></p>
        <div className={styles.formGroup}>
            <input
                type="text"
                className={styles.input}
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                disabled={loading || attemptsLeft === 0}
            />
        </div>
        <div className={styles.formGroup}>
            <input
                type="password"
                className={styles.input}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading || attemptsLeft === 0}
            />
        </div>
        <div className={styles.formGroup}>
            <input
                type="password"
                className={styles.input}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading || attemptsLeft === 0}
            />
        </div>

        <div className={styles.resendContainer}>
            {resendTimer > 0 ? (
                <p className={styles.resendText}>Resend code in <b>{resendTimer}s</b></p>
            ) : (
                <p className={styles.resendLink} onClick={onResend}>
                    Didn't receive a code? <b>Resend</b>
                </p>
            )}
        </div>

        <button 
            type="submit" 
            className={styles.authBtn} 
            disabled={loading || attemptsLeft === 0}
        >
            {loading ? "Resetting..." : "Reset Password"}
        </button>
    </form>
);