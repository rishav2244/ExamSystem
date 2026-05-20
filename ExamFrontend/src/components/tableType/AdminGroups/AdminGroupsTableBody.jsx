import React from 'react';

export const AdminGroupsTableBody = ({
    groups,
    setSelectedGroup
}) => {
    return (
        <tbody>
            {groups.length > 0 ? (
                groups.map((group) => (
                    <tr key={group.id}>
                        <td>{group.name}</td>
                        <td>
                            <button 
                                className="ViewBtn" 
                                onClick={() => setSelectedGroup(group)}
                            >
                                View
                            </button>
                        </td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="2" style={{ textAlign: 'center', padding: '20px' }}>
                        No groups found.
                    </td>
                </tr>
            )}
        </tbody>
    );
};