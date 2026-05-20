import React, { useState } from "react";
import { resendInvitation, removeCandidateFromExam } from "../../api/api";
import { usePopup } from "../popupType/usePopup";
import { useConfirm } from "../popupType/useConfirm";

export const CandidateRow = ({ candidate, examId, onRevokeSuccess }) => {
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState(candidate.status);
    const [isHovered, setIsHovered] = useState(false);

    const { showPopup } = usePopup();
    const { confirmPopup } = useConfirm();

    // Logic for resending invitation
    const handleResend = async () => {
        setSending(true);
        try {
            showPopup(`Resending invitation to ${candidate.email}...`, "info");
            const response = await resendInvitation(candidate.id);

            if (response?.success === false || response?.error) {
                showPopup(response?.message || "Failed to resend invitation.", "error");
                return;
            }
            
            setStatus("INVITED");
            showPopup("Invitation resent successfully!", "success");
        } catch (err) {
            showPopup(
                err.response?.data?.message || "Failed to resend invitation.",
                "error"
            );
        } finally {
            setSending(false);
        }
    };

    // New logic for revoking access
    const handleRevoke = async () => {
        const confirmed = await confirmPopup(
            `Are you sure you want to revoke access for ${candidate.email}? This candidate will be removed from the exam.`
        );

        if (!confirmed) return;

        setSending(true);
        try {
            // API Call to the DELETE endpoint
            await removeCandidateFromExam(examId, candidate.email);
            
            showPopup("Candidate access revoked and removed successfully.", "success");
            
            // Call the parent callback to remove from list
            if (onRevokeSuccess) {
                onRevokeSuccess(candidate.email);
            }
        } catch (err) {
            // Handles cases like "Candidate status STARTED cannot be deleted"
            const errorMsg = typeof err.response?.data === 'string' 
                ? err.response.data 
                : "Failed to revoke. They may have already started the exam.";
            showPopup(errorMsg, "error");
        } finally {
            setSending(false);
        }
    };

    const canRevoke = status === "INVITED" || status === "UNINVITED";

    return (
        <div className="candidate-item">
            <div className="candidate-info">
                <span className="candidate-name">{candidate.name}</span>
                <span className="candidate-email">{candidate.email}</span>
            </div>

            <div className="candidate-status-actions">
                <span 
                    className={`status-badge ${status} ${canRevoke ? "revocable" : ""}`}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={canRevoke ? handleRevoke : undefined}
                    style={{ 
                        cursor: canRevoke ? 'pointer' : 'default',
                        transition: 'all 0.2s ease',
                        display: 'inline-block',
                        textAlign: 'center',
                        minWidth: '100px'
                    }}
                >
                    {isHovered && canRevoke ? "REVOKE ?" : status}
                </span>

                {status === "UNINVITED" && !isHovered && (
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