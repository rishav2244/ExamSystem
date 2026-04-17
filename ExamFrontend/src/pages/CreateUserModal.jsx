import { useState } from "react";
import Papa from "papaparse";
import { bulkRegistrationAttempt } from "../api/api";
import { UserActionPopup } from "../components/popupType/UserActionPopup";

export const CreateUserModal = ({ onClose, onUserCreated }) => {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "CANDIDATE"
    });

    const [isUploading, setIsUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState(null);

    const [popup, setPopup] = useState({
        show: false,
        message: "",
        type: "info"
    });

    const showPopup = (message, type = "info") => {
        setPopup({
            show: true,
            message,
            type
        });
    };

    const closePopup = () => {
        setPopup({
            show: false,
            message: "",
            type: "info"
        });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleCsvUpload = (e) => {

        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setUploadResults(null);

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

                    if (summary.errorCount === 0) {

                        showPopup("All users uploaded successfully!", "success");

                        onUserCreated();

                    } else {

                        onUserCreated();

                    }

                } catch (err) {

                    const errMsg =
                        err.response?.data?.message || "Bulk upload failed.";

                    showPopup(`Error: ${errMsg}`, "error");

                } finally {

                    setIsUploading(false);
                    e.target.value = null;

                }
            }
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        const userPayload = {
            users: [
                {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    role: formData.role.toUpperCase(),
                    password:
                        formData.role === "ADMIN"
                            ? formData.password
                            : null
                }
            ]
        };

        try {

            const summary = await bulkRegistrationAttempt(userPayload.users);

            if (summary.errorCount > 0) {

                const errorReason =
                    summary.details[0]?.reason || "Validation Error";

                showPopup(
                    `Registration Error: ${errorReason}`,
                    "error"
                );

            } else {

                showPopup(
                    "User created successfully!",
                    "success"
                );

                onUserCreated();

            }

        } catch (err) {

            const serverMessage = err.response?.data?.message;

            showPopup(
                serverMessage ||
                "Check console for validation details",
                "error"
            );
        }
    };

    return (
        <>
            <div
                className="modal-backdrop"
                onClick={onClose}
            >
                <div
                    className="modal-window user-create-window"
                    onClick={(e) => e.stopPropagation()}
                >

                    <button
                        className="modal-close"
                        onClick={onClose}
                    >
                        ✕
                    </button>

                    <div className="user-create-header">
                        <h2>Register New User</h2>
                    </div>

                    <div className="FormDiv">

                        <div className="bulk-registration-section">

                            <p className="bulk-title">
                                Bulk Registration
                            </p>

                            <label className="csv-upload-label">

                                {isUploading
                                    ? "Processing..."
                                    : "Upload CSV File"}

                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleCsvUpload}
                                    hidden
                                    disabled={isUploading}
                                />

                            </label>

                        </div>

                        {!uploadResults && (
                            <>
                                <div className="modal-divider">
                                    <span>OR ADD MANUALLY</span>
                                </div>

                                <form onSubmit={handleSubmit}>

                                    <div className="form-group">
                                        <label>Full Name</label>

                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter full name"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Email Address</label>

                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Email"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Role</label>

                                        <select
                                            name="role"
                                            className="role-select-input"
                                            value={formData.role}
                                            onChange={handleChange}
                                        >
                                            <option value="CANDIDATE">
                                                Candidate
                                            </option>
                                            <option value="ADMIN">
                                                Admin
                                            </option>
                                        </select>
                                    </div>

                                    {formData.role === "ADMIN" && (
                                        <div className="form-group">

                                            <label>
                                                Initial Password
                                            </label>

                                            <input
                                                type="password"
                                                name="password"
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                            />

                                        </div>
                                    )}

                                    <div className="modal-footer">

                                        <button
                                            type="button"
                                            className="CloseButtonSecondary"
                                            onClick={onClose}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="form-submit"
                                        >
                                            Create User
                                        </button>

                                    </div>

                                </form>
                            </>
                        )}

                        {uploadResults && (
                            <div className="modal-footer">

                                {uploadResults && uploadResults.errorCount > 0 && (
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
                                )}

                                {uploadResults && uploadResults.errorCount === 0 && (
                                    <div className="upload-success-message">
                                        <p>✅ Successfully imported {uploadResults.successCount} users!</p>
                                    </div>
                                )}

                                <button
                                    className="form-submit"
                                    onClick={onClose}
                                >
                                    Finish
                                </button>

                            </div>
                        )}

                    </div>
                </div>
            </div>
            <UserActionPopup
                show={popup.show}
                message={popup.message}
                type={popup.type}
                onClose={() => {
                    closePopup();
                    onClose();
                }}
            />
        </>
    );
};