// import React, { useState } from 'react';
// import { CSVUploader } from '../components/buttonType/CSVUploader';
// import { DataTable } from '../components/tableType/DataTable';

// export const Admin = () => {
//   const [data, setData] = useState([]);

//   return (
//     <div
//     className="AdminOverall">
//       <CSVUploader onDataLoaded={setData} />
//       {data.length > 0 && <DataTable data={data} />}
//     </div>
//   );
// };

import { useState } from 'react';
import { CSVUploader } from '../components/buttonType/CSVUploader';
import { DataTable } from '../components/tableType/DataTable';
import { AdminHeader } from '../components/headerType/AdminHeader';
import { CreateExamCard } from '../components/cardType/CreateExamCard';

export const Admin = () => {
  const [data, setData] = useState([]);

  return (
    <div
    className="AdminOverall">
      <AdminHeader></AdminHeader>
      <CreateExamCard></CreateExamCard>
      {/* <CSVUploader onDataLoaded={setData} />
      {data.length > 0 && <DataTable data={data} />} */}
    </div>
  );
};
