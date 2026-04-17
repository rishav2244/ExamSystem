import React from 'react'

export const AdminUsersTableBody = ({
    pageData,
    setSelectedUser
}) => {
    return (
        <tbody>
            {pageData.content.length > 0 ? (
                pageData.content.map((user) => (
                    <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                            <span className={`role-badge ${user.role.toLowerCase()}`}>
                                {user.role}
                            </span>
                        </td>
                        <td>
                            <button className="ViewBtn" onClick={() => setSelectedUser(user)}>
                                View
                            </button>
                        </td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                        No users found.
                    </td>
                </tr>
            )}
        </tbody>
    )
}
