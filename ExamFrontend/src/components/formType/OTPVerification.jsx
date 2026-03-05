import { useState, useEffect } from "react";
import { resendOtp } from "../../api/api";

export const OtpVerification = ({ email, otp, setOtp, onSubmit, loading, initialResendDelay, setMessage }) => {
    const [secondsLeft, setSecondsLeft] = useState(initialResendDelay);

    useEffect(() => {
        if (secondsLeft <= 0) return;
        const timer = setInterval(() => {
            setSecondsLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [secondsLeft]);

    const handleResend = async () => {
        try {
            const data = await resendOtp(email);
            setSecondsLeft(data.waitTimeSeconds);
            setMessage(data.message);
        } catch (err) {
            setMessage(err.response?.data || "Failed to resend OTP");
        }
    };

    return (
        <form onSubmit={onSubmit}>
            <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
            />
            <button type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
                type="button"
                className="resend-button"
                disabled={secondsLeft > 0 || loading}
                onClick={handleResend}
            >
                {secondsLeft > 0 ? `Resend OTP in ${secondsLeft}s` : "Resend OTP"}
            </button>
        </form>
    );
};