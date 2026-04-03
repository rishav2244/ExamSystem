export const MailSendingModal = () => {
  return (
    <div className="mail-sending-overlay">
      <div className="mail-sending-box">

        <div className="mail-icon"></div>

        <h3>Sending Invitations...</h3>

        <p>Please wait while the mails are being sent to the candidates.</p>

        <div className="mail-progress">
          <div className="mail-progress-bar"></div>
        </div>

      </div>
    </div>
  );
};