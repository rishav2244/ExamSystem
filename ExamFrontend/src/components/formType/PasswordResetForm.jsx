import styles from "../../pages/css/ForgotPassword.module.css";

export const PasswordResetForm = ({ 
    email, 
    otp, setOtp, 
    newPassword, setNewPassword, 
    confirmPassword, setConfirmPassword,
    onSubmit, 
    loading, 
    attemptsLeft 
}) => {
    return (
        <form className={styles.form} onSubmit={onSubmit}>
            <p className={styles.stepInfo}>
                Enter the 6-digit code sent to <strong>{email}</strong>
            </p>

            <div className={styles.formGroup}>
                <label className={styles.label}>Verification Code</label>
                <input
                    type="text"
                    className={styles.input}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6-digit Code"
                    maxLength="6"
                    required
                    disabled={loading}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>New Password</label>
                <input
                    type="password"
                    className={styles.input}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    required
                    disabled={loading}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Confirm New Password</label>
                <input
                    type="password"
                    className={styles.input}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm New Password"
                    required
                    disabled={loading}
                />
            </div>

            <button 
                type="submit" 
                className={styles.authBtn} 
                disabled={loading || attemptsLeft === 0}
            >
                {loading ? "Updating..." : "Reset Password"}
            </button>

            <div className={styles.otpActions}>
                <button 
                    type="button" 
                    className={styles.resendBtn} 
                    disabled={true} 
                >
                    Resend Code (Available soon)
                </button>
            </div>
        </form>
    );
};