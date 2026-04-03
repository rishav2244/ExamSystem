export const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-modal">

        <h3 className="popup-title warning">
          Confirmation
        </h3>

        <p className="popup-message">
          {message}
        </p>

        <div className="confirm-buttons">

          <button
            className="confirm-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="confirm-ok"
            onClick={onConfirm}
          >
            Confirm
          </button>

        </div>

      </div>
    </div>
  );
};