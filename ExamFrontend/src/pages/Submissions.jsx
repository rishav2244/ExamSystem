import { useEffect, useState } from 'react';
import { getExams } from '../api/api';
import { SubmissionDetailsModal } from './SubmissionDetailsModal';

export const Submissions = () => {
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);

    useEffect(() => {
        getExams().then(setExams).catch(console.error);
    }, []);

    return (
        <div className="SubmissionsPage">
            <h2>Exam Submissions</h2>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Exam Title</th>
                        <th>Status</th>
                        <th>Duration</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {exams.map(exam => (
                        <tr key={exam.id}>
                            <td>{exam.title}</td>
                            <td>{exam.status}</td>
                            <td>{exam.duration} mins</td>
                            <td>
                                <button onClick={() => setSelectedExam(exam)}>View Results</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedExam && (
                <SubmissionDetailsModal 
                    exam={selectedExam} 
                    onClose={() => setSelectedExam(null)} 
                />
            )}
        </div>
    );
};