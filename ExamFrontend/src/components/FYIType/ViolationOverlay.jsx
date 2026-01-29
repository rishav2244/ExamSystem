export const ViolationOverlay = ({ count, isDisqualified, onDismiss, onFinalize }) => {
    if (isDisqualified) {
        return (
            <div className="modal-backdrop violation-overlay">
                <div className="modal-window" style={{ height: 'auto', minHeight: '250px' }}>
                    <h2 className="warning-text">EXAM TERMINATED</h2>
                    <p>You have reached <b>3 violations</b>.</p>
                    <p>Your access has been revoked due to proctoring violations.</p>
                    <button className="DeleteExamButton" onClick={onFinalize}>
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-backdrop violation-overlay">
            <div className="modal-window" style={{ height: 'auto', minHeight: '200px' }}>
                <h2 className="warning-text">⚠️ VIOLATION DETECTED</h2>
                <p>Strike <b>{count} / 3</b> recorded.</p>
                <p>You must stay in <b>Fullscreen Mode</b> and remain on this tab.</p>
                <button className="form-submit" onClick={onDismiss}>
                    Return to Fullscreen & Continue
                </button>
            </div>
        </div>
    );
};