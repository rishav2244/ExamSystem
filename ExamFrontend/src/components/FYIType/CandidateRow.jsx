// import { resendInvitation } from "../../api/api";
// import { useState } from "react";
 
// export const CandidateRow = ({ candidate }) => {
//     const [sending, setSending] = useState(false);
//     const [status, setStatus] = useState(candidate.status);
 
//     const handleResend = async () => {
//         setSending(true);
//         try {
//             await resendInvitation(candidate.id);
//             setStatus("INVITED");
//             alert(`Invitation resent to ${candidate.email}`);
//         } catch (err) {
//             alert("Failed to resend. Check connection.");
//         } finally {
//             setSending(false);
//         }
//     };
 
//     return (
//         <div className="candidate-item">
//             <div className="candidate-info">
//                  <span className="candidate-name">{candidate.name}</span>
//                 <span className="candidate-email">{candidate.email}</span>
//             </div>
            
//             <div className="candidate-status-actions">
//                 <span className={`status-badge ${status}`}>
//                     {status}
//                 </span>
//                 {status == "UNINVITED" && (
//                     <button
//                         onClick={handleResend}
//                         disabled={sending}
//                         className="resend-btn"
//                     >
//                         {sending ? "..." : "Resend"}
//                     </button>
//                 )}
//             </div>
//         </div>
//     );
// };
 
 import { resendInvitation } from "../../api/api";
import { useState } from "react";
import { usePopup } from "../popupType/usePopup"; // ✅ ADD THIS

export const CandidateRow = ({ candidate }) => {

    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState(candidate.status);

    const { showPopup } = usePopup(); // ✅ ADD THIS

    const handleResend = async () => {

        setSending(true);

        try {

            // show sending popup (no OK button)
            showPopup(`Resending invitation to ${candidate.email}...`, "info", 0);

            await resendInvitation(candidate.id);

            setStatus("INVITED");

            // success popup (auto close)
            showPopup("Invitation resent successfully!", "success", 2000);

        } catch (err) {

            showPopup("Failed to resend invitation.", "error");

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