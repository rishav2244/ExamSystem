import { useEffect, useState } from 'react';
import { AdminHeader } from '../components/headerType/AdminHeader';
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
            <AdminHeader></AdminHeader>

            <div
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
            </div>

            {isCreateModalOpen && (
                <CreateExamModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onExamCreated={fetchExams} />
            )}

            {SelectedExam && (
                <ExamDetailsModal
                    exam = {SelectedExam}
                    onClose={() => setSelectedExam(false)}
                    onQuestionsUploaded={fetchExams}/>
            )}
        </div>
    );
};
