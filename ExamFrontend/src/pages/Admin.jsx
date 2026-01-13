// import { useState } from 'react';
// import { CSVUploader } from '../components/buttonType/CSVUploader';
// import { DataTable } from '../components/tableType/DataTable';
// import { AdminHeader } from '../components/headerType/AdminHeader';
// import { CreateExamCard } from '../components/cardType/CreateExamCard';
// import { CreateExamModal } from './CreateExamModal';

// export const Admin = () => {
//   const [data, setData] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   return (
//     <div
//       className="AdminOverall">
//       <AdminHeader></AdminHeader>
//       <CreateExamCard
//       onClick={() => {setIsModalOpen(true)}}></CreateExamCard>
//       {isModalOpen && (
//         <CreateExamModal
//           onClose={() => setIsModalOpen(false)} />
//       )}
//       {/* <CSVUploader onDataLoaded={setData} />
//       {data.length > 0 && <DataTable data={data} />} */}
//     </div>
//   );
// };

import { useEffect, useState } from 'react';
import { AdminHeader } from '../components/headerType/AdminHeader';
import { CreateExamCard } from '../components/cardType/CreateExamCard';
import { CreateExamModal } from './CreateExamModal';
import { ExamCard } from '../components/cardType/ExamCard';
import { getExams } from '../api/api';

export const Admin = () => {
    const [listExams, setListExams] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

            {listExams.map((exam) => (
                <ExamCard
                    key={exam.id}
                    examName={exam.title}
                    examStatus={exam.status}
                />
            ))}

            <CreateExamCard
                onClick={() => { setIsModalOpen(true) }}></CreateExamCard>
            {isModalOpen && (
                <CreateExamModal
                    onClose={() => setIsModalOpen(false)} 
                    onExamCreated={fetchExams}/>
            )}
        </div>
    );
};
