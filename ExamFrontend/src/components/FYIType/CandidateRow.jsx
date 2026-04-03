import { resendInvitation } from "../../api/api";
import { useState } from "react";
import { usePopup } from "../popupType/usePopup";

export const CandidateRow = ({ candidate }) => {

    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState(candidate.status);

    const { showPopup } = usePopup();
    const handleResend = async () => {

        setSending(true);

        try {

            showPopup(`Resending invitation to ${candidate.email}...`, "info", 0);

            const response = await resendInvitation(candidate.id);

            // ✅ IMPORTANT CHECK
            if (response?.success === false || response?.error) {

                showPopup(response?.message || "Failed to resend invitation.", "error");
                return;
            }

            // ✅ SUCCESS ONLY IF ACTUALLY SUCCESS
            setStatus("INVITED");
            showPopup("Invitation resent successfully!", "success", 2000);

        } catch (err) {

            showPopup(
                err.response?.data?.message || "Failed to resend invitation.",
                "error"
            );

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

                {status === "UNINVITED" && (
                    <button
                        onClick={handleResend}
                        disabled={sending}
                        className="resend-btn"
                    >
                        {sending ? "Sending..." : "Resend"}
                    </button>
                )}

            </div>

        </div>
    );
};