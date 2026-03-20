import React from "react";

export const UserActionPopup = ({ show, message, type, onClose }) => {

    if (!show) return null;

    const title =
        type === "error"
            ? "Error"
            : type === "success"
            ? "Success"
            : "Notification";

    return (
        <div className="modal-backdrop">
            <div className="popup-modal">

                <h3 className={`popup-title ${type}`}>
                    {title}
                </h3>

                <p className="popup-message">
                    {message}
                </p>

                <div className="popup-divider"></div>

                <div className="popup-footer">
                    <button
                        className="popup-btn"
                        onClick={onClose}
                    >
                        OK
                    </button>
                </div>

            </div>
        </div>
    );
};