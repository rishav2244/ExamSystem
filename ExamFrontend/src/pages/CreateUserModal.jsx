import { useState } from 'react';
import Papa from 'papaparse';
import { registrationAttempt, bulkRegistrationAttempt } from '../api/api';

export const CreateUserModal = ({ onClose, onUserCreated }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'CANDIDATE'
    });
    
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState(null); 

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
                const formattedUsers = results.data.map(row => ({
                    name: row.Name || row.name || "",
                    email: row.Email || row.email || "",
                    role: (row.Role || row.role || "CANDIDATE").toUpperCase(),
                    password: row.Password || row.password || null
                }));

                try {
                    const summary = await bulkRegistrationAttempt(formattedUsers);
                    setUploadResults(summary); 
                    
                    if (summary.errorCount === 0) {
                        alert("All users uploaded successfully!");
                        onUserCreated();
                        onClose();
                    } else {
                        
                        onUserCreated(); 
                    }
                } catch (err) {
                    const errMsg = err.response?.data?.message || "Bulk upload failed.";
                    alert(`Error: ${errMsg}`);
                } finally {
                    setIsUploading(false);
                    e.target.value = null;
                }
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const passwordValue = formData.role === 'CANDIDATE' ? 'default_placeholder' : formData.password;
        try {
            await registrationAttempt(formData.email, formData.name, passwordValue, formData.role);
            alert("User created successfully!");
            onUserCreated();
            onClose();
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || "Failed to create user."}`);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-window user-create-window" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                
                <div className="user-create-header">
                    <h2>Register New User</h2>
                </div>

                <div className="FormDiv">
                    <div className="bulk-registration-section">
                        <p className="bulk-title">Bulk Registration</p>
                        <label className="csv-upload-label">
                            {isUploading ? "Processing..." : "Upload CSV File"}
                            <input type="file" accept=".csv" onChange={handleCsvUpload} hidden disabled={isUploading} />
                        </label>

                        
                        {uploadResults && uploadResults.errorCount > 0 && (
                            <div className="error-log-container">
                                <p className="error-summary">
                                    Processed {uploadResults.totalProcessed}: 
                                    <span className="success-text"> {uploadResults.successCount} Success</span>, 
                                    <span className="failure-text"> {uploadResults.errorCount} Failed</span>
                                </p>
                                <div className="error-list">
                                    {uploadResults.details.map((err, index) => (
                                        <div key={index} className="error-item">
                                            <strong>{err.email}:</strong> {err.reason}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {!uploadResults && (
                        <>
                            <div className="modal-divider">
                                <span>OR ADD MANUALLY</span>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Enter full name" />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="Email" />
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <select name="role" className="role-select-input" value={formData.role} onChange={handleChange}>
                                        <option value="CANDIDATE">Candidate</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                                {formData.role === 'ADMIN' && (
                                    <div className="form-group">
                                        <label>Initial Password</label>
                                        <input type="password" name="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" />
                                    </div>
                                )}
                                <div className="modal-footer">
                                    <button type="button" className="CloseButtonSecondary" onClick={onClose}>Cancel</button>
                                    <button type="submit" className="form-submit">Create User</button>
                                </div>
                            </form>
                        </>
                    )}
                    
                    {uploadResults && (
                         <div className="modal-footer">
                            <button className="form-submit" onClick={onClose}>Finish</button>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};