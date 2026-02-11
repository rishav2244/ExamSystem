import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSnapshots } from "../api/api";

export const SnapshotGallery = () => {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const [snapshots, setSnapshots] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSnapshots(submissionId)
            .then(setSnapshots)
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [submissionId]);

    if (loading) return <div className="page-loading">Loading proctoring logs...</div>;

    return (
        <div className="snapshot-gallery-page">
            <div className="gallery-header">
                <button onClick={() => navigate(-1)} className="back-btn">← Back to Review</button>
                <h2>Proctoring Snapshots</h2>
            </div>

            {snapshots.length === 0 ? (
                <div className="no-snapshots">No snapshots were captured for this session.</div>
            ) : (
                <div className="snapshot-grid">
                    {snapshots.map((snap) => {
                        const isViolation = snap.violation === true || snap.isViolation === true;

                        return (
                            <div
                                key={snap.id}
                                className={`snapshot-card ${isViolation ? 'violation' : ''}`}
                            >
                                {/* Tag will only show if isViolation is true */}
                                {isViolation && <span className="violation-tag">Violation</span>}

                                <img src={snap.imageUrl} alt="Proctoring Capture" loading="lazy" />

                                <div className={`snapshot-info ${isViolation ? 'violation-info' : ''}`}>
                                    <span>{new Date(snap.createdAt).toLocaleString()}</span>
                                    {isViolation && (
                                        <div style={{ color: '#c62828', fontSize: '10px', fontWeight: 'bold', marginTop: '4px' }}>
                                            FLAGGED ACTIVITY
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};