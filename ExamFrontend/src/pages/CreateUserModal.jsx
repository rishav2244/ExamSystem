import { useState } from "react";
import { UserActionPopup } from "../components/popupType/UserActionPopup";
import { BulkRegistration } from "../components/uploadType/BulkRegistration";
import { UserManualForm } from "../components/uploadType/UserManualForm";

export const CreateUserModal = ({ onClose, onUserCreated }) => {
    const [hasResults, setHasResults] = useState(false);
    const [popup, setPopup] = useState({ show: false, message: "", type: "info" });

    const handleActionFeedback = (message, type = "info", shouldRefresh = false) => {
        setPopup({ show: true, message, type });
        if (shouldRefresh) onUserCreated();
    };

    const closePopup = () => {
        setPopup({ ...popup, show: false });
        onClose();
    };

    return (
        <>
            <div className="modal-backdrop" onClick={onClose}>
                <div 
                    className="modal-window user-create-window" 
                    onClick={(e) => e.stopPropagation()}
                >
                    <button className="modal-close" onClick={onClose}>✕</button>

                    <div className="user-create-header">
                        <h2>Register New User</h2>
                    </div>

                    <div className="FormDiv">
                        <BulkRegistration 
                            onUploadStart={() => setHasResults(false)}
                            onUploadComplete={(summary) => {
                                setHasResults(true);
                                onUserCreated(); // Refresh list on background
                                if (summary.errorCount === 0) {
                                    handleActionFeedback("All users uploaded successfully!", "success");
                                }
                            }}
                            onError={(msg) => handleActionFeedback(msg, "error")}
                        />

                        {!hasResults && (
                            <>
                                <div className="modal-divider">
                                    <span>OR ADD MANUALLY</span>
                                </div>
                                <UserManualForm 
                                    onUserCreated={(msg) => handleActionFeedback(msg, "success", true)}
                                    onError={(msg) => handleActionFeedback(msg, "error")}
                                    onCancel={onClose}
                                />
                            </>
                        )}

                        {hasResults && (
                            <div className="modal-footer">
                                <button className="form-submit" onClick={onClose}>
                                    Finish
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <UserActionPopup
                show={popup.show}
                message={popup.message}
                type={popup.type}
                onClose={closePopup}
            />
        </>
    );
};