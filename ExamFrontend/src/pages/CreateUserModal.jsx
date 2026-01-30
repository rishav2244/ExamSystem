import { useState } from 'react';
import { registrationAttempt } from '../api/api';

export const CreateUserModal = ({ onClose, onUserCreated }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'CANDIDATE'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const passwordValue = formData.role === 'CANDIDATE' ? 'default_placeholder' : formData.password;

        try {
            await registrationAttempt(
                formData.email,
                formData.name,
                passwordValue,
                formData.role
            );
            alert("User created successfully!");
            onUserCreated();
            onClose();
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to create user.";
            alert(`Registration Error: ${errorMessage}`);
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

                        {formData.role === 'ADMIN' && (
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
                </div>
            </div>
        </div>
    );
};