import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerCandidate, verifyRegistrationOtp } from "../api/api";
import { RegistrationForm } from "../components/formType/RegistrationForm";
import { OtpVerification } from "../components/formType/OTPVerification";

export const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [resendDelay, setResendDelay] = useState(60);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const loginRedirectTime = 2000;

    const handleSendOtp = async (e) => {
        setLoading(true);
        setMessage("");
        try {
            const data = await registerCandidate(name, email, password);
            console.log(data);
            setResendDelay(data.resendSeconds);
            setStep(2);
            setMessage(data.message);
        } catch (err) {
            setMessage(err.response?.data || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        try {
            await verifyRegistrationOtp(email, otp);
            setMessage("Registration successful! Redirecting to login in "+(loginRedirectTime/1000)+" seconds...");
            setTimeout(() => navigate("/login"), loginRedirectTime);
        } catch (err) {
            setMessage(err.response?.data || "OTP verification failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{step === 1 ? "Candidate Registration" : "Verify OTP"}</h2>

                {step === 1 ? (
                    <RegistrationForm
                        name={name} setName={setName}
                        email={email} setEmail={setEmail}
                        password={password} setPassword={setPassword}
                        onSubmit={handleSendOtp}
                        loading={loading}
                    />
                ) : (
                    <OtpVerification
                        email={email}
                        otp={otp} setOtp={setOtp}
                        onSubmit={handleVerifyOtp}
                        loading={loading}
                        initialResendDelay={resendDelay}
                        setMessage={setMessage}
                    />
                )}

                {message && <p className="auth-message">{message}</p>}

                <p className="switch-auth">
                    Already registered?{" "}
                    <span onClick={() => navigate("/login")}>Login</span>
                </p>
            </div>
        </div>
    );
};