import React from "react";
import { CandidateRow } from "./CandidateRow";

export const ExamCandidatePanel = ({
    examId,
    examStatus,
    availableGroups,
    selectedGroupId,
    onGroupChange,
    candidates,
    setCandidates,
    currentPage,
    totalPages,
    onPageChange
}) => {
    const shouldShowList = (examStatus === "SAVED" && selectedGroupId) || examStatus === "PUBLISHED";

    // Callback used by CandidateRow to update this component's state
    const handleLocalRevoke = (email) => {
        if (setCandidates) {
            setCandidates(prev => prev.filter(c => c.email !== email));
        }
    };

    if (!shouldShowList && examStatus !== "SAVED") return null;

    return (
        <div className="view-section">
            {examStatus === "SAVED" && (
                <div className="group-assignment-section">
                    <h4>Select Candidate Group</h4>
                    <div className="group-input-group">
                        <select
                            value={selectedGroupId}
                            onChange={(e) => onGroupChange(e.target.value)}
                            className="group-dropdown"
                        >
                            <option value="">-- Select Group to Assign --</option>
                            {availableGroups.map((grp) => (
                                <option key={grp.id} value={grp.id}>
                                    {grp.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {shouldShowList && (
                <div className="candidate-list-container">
                    <h5>
                        {examStatus === "PUBLISHED"
                            ? "Assigned Candidates"
                            : "Draft Candidate List"} ({candidates.length})
                    </h5>

                    <div className="candidate-scroll">
                        {candidates.length > 0 ? (
                            candidates.map((c) => (
                                <CandidateRow 
                                    key={c.id || c.email} 
                                    candidate={c} 
                                    examId={examId}
                                    onRevokeSuccess={handleLocalRevoke}
                                />
                            ))
                        ) : (
                            <p className="no-candidates-msg">No candidates found.</p>
                        )}
                    </div>

                    {examStatus === "PUBLISHED" && totalPages > 1 && (
                        <div className="UserPagination">
                            <button
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                            >
                                Previous
                            </button>

                            <div className="page-jump-container">
                                <span>Page</span>
                                <input
                                    type="number"
                                    className="page-input"
                                    value={currentPage + 1}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (!isNaN(val)) onPageChange(val - 1);
                                    }}
                                />
                                <span>of {totalPages}</span>
                            </div>

                            <button
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages - 1}
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {examStatus === "SAVED" && (
                        <p className="draft-notice">
                            Review carefully. This list will be finalized on Publish.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};