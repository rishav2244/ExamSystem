import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerCandidate, verifyOtp } from "../api/api";

export const Register = () => {

    const navigate = useNavigate();

    const [step, setStep] = useState(1);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [otp, setOtp] = useState("");

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");

        try {

            await registerCandidate(name, email, password);

            setStep(2);
            setMessage("OTP sent to your email.");

        } catch (err) {

            setMessage(
                err.response?.data ||
                "Failed to send OTP"
            );

        } finally {
            setLoading(false);
        }
    };


    const handleVerifyOtp = async (e) => {

        e.preventDefault();

        setLoading(true);
        setMessage("");

        try {

            await verifyOtp(email, otp);

            setMessage("Registration successful!");

            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (err) {

            setMessage(
                err.response?.data ||
                "OTP verification failed"
            );

        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="auth-container">

            <div className="auth-card">

                <h2>Candidate Registration</h2>


                {step === 1 && (

                    <form onSubmit={handleSendOtp}>

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
                            {loading ? "Sending OTP..." : "Send OTP"}
                        </button>

                    </form>

                )}


                {step === 2 && (

                    <form onSubmit={handleVerifyOtp}>

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

                    </form>

                )}

                {message && <p className="auth-message">{message}</p>}

                <p className="switch-auth">
                    Already registered?{" "}
                    <span onClick={() => navigate("/login")}>
                        Login
                    </span>
                </p>

            </div>

        </div>
    );
};