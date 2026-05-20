import React from 'react';

export const AdminSubmissionsTableBody = ({
    exams,
    searchQuery,
    setSelectedExam
}) => {
    return (
        <tbody>
            {exams.length > 0 ? (
                exams.map((exam) => (
                    <tr key={exam.id}>
                        <td>{exam.title}</td>
                        <td>
                            <span className={`status-badge ${exam.status?.toLowerCase()}`}>
                                {exam.status}
                            </span>
                        </td>
                        <td>{exam.duration} mins</td>
                        <td>
                            <button 
                                className="ViewBtn" 
                                onClick={() => setSelectedExam(exam)}
                            >
                                View Results
                            </button>
                        </td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                        {searchQuery ? 'No exams found matching your search.' : 'No exams found.'}
                    </td>
                </tr>
            )}
        </tbody>
    );
};