import { useState } from 'react';
import { resetPassword } from '../api/api';

export const ResetPasswordModal = ({ email, onClose }) => {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            alert("New passwords do not match!");
            return;
        }

        try {
            await resetPassword(email, formData.oldPassword, formData.newPassword);
            alert("Password updated successfully!");
            onClose();
        } catch (err) {
            alert(err.response?.data || "Failed to update password.");
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-window user-create-window" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <div className="user-create-header">
                    <h2>Change Password</h2>
                </div>
                <div className="FormDiv">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Current Password</label>
                            <input 
                                type="password" name="oldPassword" required 
                                value={formData.oldPassword} onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input 
                                type="password" name="newPassword" required 
                                value={formData.newPassword} onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input 
                                type="password" name="confirmPassword" required 
                                value={formData.confirmPassword} onChange={handleChange}
                            />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="CloseButtonSecondary" onClick={onClose}>Cancel</button>
                            <button type="submit" className="form-submit">Update Password</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};