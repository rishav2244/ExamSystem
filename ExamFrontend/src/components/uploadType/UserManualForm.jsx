import { useState } from "react";
import { bulkRegistrationAttempt } from "../../api/api";

export const UserManualForm = ({ onUserCreated, onError, onCancel }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "CANDIDATE"
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const userPayload = [
            {
                name: formData.name.trim(),
                email: formData.email.trim(),
                role: formData.role.toUpperCase(),
                password: formData.role === "ADMIN" ? formData.password : null
            }
        ];

        try {
            const summary = await bulkRegistrationAttempt(userPayload);

            if (summary.errorCount > 0) {
                const errorReason = summary.details[0]?.reason || "Validation Error";
                onError(`Registration Error: ${errorReason}`);
            } else {
                onUserCreated("User created successfully!");
            }
        } catch (err) {
            const serverMessage = err.response?.data?.message;
            onError(serverMessage || "Check console for validation details");
        }
    };

    return (
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
                    <option value="CANDIDATE">Candidate</option>
                    <option value="ADMIN">Admin</option>
                </select>
            </div>

            {formData.role === "ADMIN" && (
                <div className="form-group">
                    <label>Initial Password</label>
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
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button type="submit" className="form-submit">
                    Create User
                </button>
            </div>
        </form>
    );
};