import { resendInvitation } from "../../api/api";
import { useState } from "react";
 
export const CandidateRow = ({ candidate }) => {
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState(candidate.status);
 
    const handleResend = async () => {
        setSending(true);
        try {
            await resendInvitation(candidate.id);
            setStatus("INVITED");
            alert(`Invitation resent to ${candidate.email}`);
        } catch (err) {
            alert("Failed to resend. Check connection.");
        } finally {
            setSending(false);
        }
    };
 
    return (
        <div className="candidate-item">
            <div className="candidate-info">
                 <span className="candidate-name">{candidate.name}</span>
                <span className="candidate-email">{candidate.email}</span>
            </div>
            
            <div className="candidate-status-actions">
                <span className={`status-badge ${status}`}>
                    {status}
                </span>
                {status == "UNINVITED" && (
                    <button
                        onClick={handleResend}
                        disabled={sending}
                        className="resend-btn"
                    >
                        {sending ? "..." : "Resend"}
                    </button>
                )}
            </div>
        </div>
    );
};
 