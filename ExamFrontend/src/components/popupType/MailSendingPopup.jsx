export const MailSendingPopup = ({ message }) => {
  return (
    <div className="mail-popup-overlay">
      <div className="mail-popup-box">

        <div className="mail-loader"></div>

        <h3>{message || "Sending Invitations..."}</h3>
        <p>Please wait while emails are being sent to candidates.</p>

      </div>
    </div>
  );
};