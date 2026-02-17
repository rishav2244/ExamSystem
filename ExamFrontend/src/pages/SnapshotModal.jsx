import React, { useState } from 'react';

export const SnapshotModal = ({ pair, initialIdx, onClose }) => {
    const [currentIdx, setCurrentIdx] = useState(initialIdx);
    const currentSnap = pair[currentIdx];

    const toggle = (e) => {
        e.stopPropagation();
        if (pair.length > 1) {
            setCurrentIdx(prev => (prev === 0 ? 1 : 0));
        }
    };

    return (
        <div className="pg-modal-overlay" onClick={onClose}>
            <div className="pg-modal-content" onClick={e => e.stopPropagation()}>
                {/* Close button now inside and relative to content */}
                <div className="pg-modal-header">
                    <span className="pg-modal-title">Evidence View - {currentSnap.type}</span>
                    <button className="pg-modal-close-simple" onClick={onClose}>✕</button>
                </div>
                
                <div className="pg-modal-body">
                    <div className="pg-image-wrapper">
                        <img src={currentSnap.imageUrl} alt="Zoomed view" className="pg-modal-img" />
                    </div>
                    
                    {pair.length > 1 && (
                        <div className="pg-modal-switcher">
                            <button onClick={toggle} className="pg-toggle-btn">
                                Switch to {currentSnap.type === 'WEBCAM' ? 'SCREENSHOT' : 'WEBCAM'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="pg-modal-footer">
                    <span className="pg-footer-time">{new Date(currentSnap.createdAt).toLocaleString()}</span>
                    {currentSnap.sl_violation && (
                        <span className="pg-footer-violation">Violation Set #{currentSnap.sl_violation}</span>
                    )}
                </div>
            </div>
        </div>
    );
};