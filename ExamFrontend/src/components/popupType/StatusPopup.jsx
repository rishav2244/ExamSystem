import Papa from 'papaparse';

export const StatusPopup = ({ message, type, onClose, data = null }) => {
    
    const handleDownloadFailures = () => {
        if (!data || data.length === 0) return;
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `skipped_emails_${Date.now()}.csv`);
        link.click();
    };

    return (
        <div className="pop-overlay">
            <div className={`pop-card ${type} ${data ? 'wide' : ''}`}>
                <div className="pop-icon">
                    {type === 'error' ? '⚠️' : (type === 'warning' ? 'ℹ️' : '✅')}
                </div>
                <div className="pop-msg">{message}</div>

                {data && data.length > 0 && (
                    <div className="pop-report-area">
                        <strong style={{fontSize: '0.85rem'}}>Skipped Items:</strong>
                        <div className="pop-list">
                            {data.map((fail, index) => (
                                <div key={index} className="pop-item">
                                    <span className="pop-email">{fail.email}</span>
                                    <span className="pop-reason">{fail.reason}</span>
                                </div>
                            ))}
                        </div>
                        <button type="button" className="pop-dl-btn" onClick={handleDownloadFailures}>
                             Download List as CSV
                        </button>
                    </div>
                )}

                <button type="button" className="pop-close-btn" onClick={onClose}>
                    Understood
                </button>
            </div>
        </div>
    );
};