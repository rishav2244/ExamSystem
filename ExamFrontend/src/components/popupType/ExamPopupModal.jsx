import React from "react";

export const ExamPopupModal = ({ message, type, onClose }) => {

  const getTitle = () => {
    if (type === "success") return "Success";
    if (type === "error") return "Error";
    if (type === "warning") return "Warning";
    return "Notification";
  };

  return (
    <div className="popup-overlay">
      <div className="popup-modal">

        <h3 className={`popup-title ${type}`}>
          {getTitle()}
        </h3>

        <p className="popup-message">
          {message}
        </p>

        <button className="popup-button" onClick={onClose}>
          OK
        </button>

      </div>
    </div>
  );
};