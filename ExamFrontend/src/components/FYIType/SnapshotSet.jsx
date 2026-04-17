export const SnapshotSet = ({ pair, onOpen }) => {
    const isViolation = pair[0].violation;
    const slNo = pair[0].sl_violation;

    return (
        <div className={`pg-set-container ${isViolation ? 'pg-is-violation' : ''}`}>
            <div className="pg-set-header">
                <span className="pg-set-time">{new Date(pair[0].createdAt).toLocaleTimeString()}</span>
                {isViolation && <span className="pg-violation-label">VIOLATION #{slNo}</span>}
            </div>
            
            <div className="pg-set-previews">
                {pair.map((snap, idx) => (
                    <div key={snap.id} className="pg-preview-card" onClick={() => onOpen(pair, idx)}>
                        <img src={snap.imageUrl} alt={snap.type} className="pg-preview-img" />
                        <div className="pg-preview-overlay">
                            <span>{snap.type}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};