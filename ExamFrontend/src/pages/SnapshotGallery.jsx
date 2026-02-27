import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSnapshots, getSecureImageUrl} from "../api/api";
import { SnapshotSet } from "../components/FYIType/SnapshotSet";
import { SnapshotModal } from "./SnapshotModal";

export const SnapshotGallery = () => {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const [snapshots, setSnapshots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null);

    useEffect(() => {
        getSnapshots(submissionId)
            .then(async (data) => {
                const unlockedSnapshots = await Promise.all(data.map(async (snap) => ({
                    ...snap,
                    imageUrl: await getSecureImageUrl(snap.imageUrl)
                })));
                setSnapshots(unlockedSnapshots);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [submissionId]);

    const groupedSnapshots = useMemo(() => {
        const groups = {};
        const standalone = [];

        snapshots.forEach(snap => {
            if (snap.sl_violation) {
                if (!groups[snap.sl_violation]) groups[snap.sl_violation] = [];
                groups[snap.sl_violation].push(snap);
            } else {
                standalone.push([snap]);
            }
        });

        return [...Object.values(groups), ...standalone].sort((a, b) =>
            new Date(a[0].createdAt) - new Date(b[0].createdAt)
        );
    }, [snapshots]);

    if (loading) return <div className="pg-loading">Loading session logs...</div>;

    return (
        <div className="pg-gallery-wrapper">
            <div className="pg-gallery-nav">
                <button onClick={() => navigate(-1)} className="pg-back-button">← Return</button>
                <h2 className="pg-gallery-title">Proctoring Timeline</h2>
            </div>

            <div className="pg-timeline-list">
                {groupedSnapshots.length === 0 ? (
                    <div className="pg-empty-state">No evidence captured for this session.</div>
                ) : (
                    groupedSnapshots.map((pair, idx) => (
                        <SnapshotSet
                            key={idx}
                            pair={pair}
                            onOpen={(p, i) => setActiveModal({ pair: p, index: i })}
                        />
                    ))
                )}
            </div>

            {activeModal && (
                <SnapshotModal
                    pair={activeModal.pair}
                    initialIdx={activeModal.index}
                    onClose={() => setActiveModal(null)}
                />
            )}
        </div>
    );
};