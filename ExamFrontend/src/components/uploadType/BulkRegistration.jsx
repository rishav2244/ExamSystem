import Papa from "papaparse";
import { useState } from "react";
import { bulkRegistrationAttempt } from "../../api/api";

export const BulkRegistration = ({ onUploadStart, onUploadComplete, onError }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState(null);

    const handleCsvUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        onUploadStart();

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const formattedUsers = results.data.map((row) => ({
                    name: row.Name || row.name || "",
                    email: row.Email || row.email || "",
                    role: (row.Role || row.role || "CANDIDATE").toUpperCase(),
                    password: row.Password || row.password || null
                }));

                try {
                    const summary = await bulkRegistrationAttempt(formattedUsers);
                    setUploadResults(summary);
                    onUploadComplete(summary);
                } catch (err) {
                    const errMsg = err.response?.data?.message || "Bulk upload failed.";
                    onError(errMsg);
                } finally {
                    setIsUploading(false);
                    e.target.value = null;
                }
            }
        });
    };

    if (uploadResults) {
        return (
            <div className="upload-results-summary">
                {uploadResults.errorCount > 0 ? (
                    <div className="upload-errors-container">
                        <h3 className="error-title">
                            Partial Success: {uploadResults.successCount} added, {uploadResults.errorCount} failed
                        </h3>
                        <div className="error-list-scrollable">
                            <table className="error-table">
                                <thead>
                                    <tr>
                                        <th>Email</th>
                                        <th>Reason</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {uploadResults.details.map((err, index) => (
                                        <tr key={index}>
                                            <td className="error-email">{err.email}</td>
                                            <td className="error-reason">{err.reason}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="upload-success-message">
                        <p> Successfully imported {uploadResults.successCount} users!</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bulk-registration-section">
            <p className="bulk-title">Bulk Registration</p>
            <label className="csv-upload-label">
                {isUploading ? "Processing..." : "Upload CSV File"}
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    hidden
                    disabled={isUploading}
                />
            </label>
        </div>
    );
};