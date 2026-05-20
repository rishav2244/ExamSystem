import styles from "../../pages/css/ForgotPassword.module.css";

export const EmailEntryForm = ({ email, setEmail, onSubmit, loading }) => {
    return (
        <form className={styles.form} onSubmit={onSubmit}>
            <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                    type="email"
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                    disabled={loading}
                />
            </div>
            <button 
                type="submit" 
                className={styles.authBtn} 
                disabled={loading}
            >
                {loading ? "Processing..." : "Send Reset Code"}
            </button>
        </form>
    );
};