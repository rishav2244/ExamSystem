import { useEffect, useState } from 'react';
import { CreateExamCard } from '../components/cardType/CreateExamCard';
import { CreateExamModal } from './CreateExamModal';
import { ExamDetailsModal } from './ExamDetailsModal';
import { ExamCard } from '../components/cardType/ExamCard';
import { getExams } from '../api/api';

export const Admin = () => {
    const [listExams, setListExams] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [SelectedExam, setSelectedExam] = useState(null);

    const fetchExams = async () => {
        try {
            const exams = await getExams();
            setListExams(exams);
        } catch (err) {
            console.error("Failed to fetch exams:", err);
            alert("Failed to fetch exams");
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);


    return (
        <div
            className="AdminOverall">

            {/* <div
                className="CardArea">
                <CreateExamCard
                    onClick={() => { setIsCreateModalOpen(true) }}></CreateExamCard>

                {listExams.map((exam) => (
                    <ExamCard
                        key={exam.id}
                        exam={exam}
                        onClick={() => { setSelectedExam(exam) }}
                    />
                ))}
            </div> */}

            <div className="AdminExamSection">
                <div className="AdminExamHeader">
                    <h2>Exams</h2>
                    <button
                        className="CreateExamBtn"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        + Create Exam
                    </button>
                </div>

                <table className="ExamTable">
                    <thead>
                        <tr>
                            <th>Exam Name</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {listExams.map((exam) => (
                            <tr key={exam.id}>
                                <td>{exam.title}</td>

                                <td>
                                    <span className={`status ${exam.status.toLowerCase()}`}>
                                        {exam.status}
                                    </span>
                                </td>

                                <td>
                                    <button
                                        className="ViewBtn"
                                        onClick={() => setSelectedExam(exam)}
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


            {isCreateModalOpen && (
                <CreateExamModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onExamCreated={fetchExams} />
            )}

            {SelectedExam && (
                <ExamDetailsModal
                    exam={SelectedExam}
                    onClose={() => setSelectedExam(false)}
                    onQuestionsUploaded={fetchExams} />
            )}
        </div>
    );
};
