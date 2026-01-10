import React, { useState } from 'react';
import { CSVUploader } from '../components/buttonType/CSVUploader';
import { DataTable } from '../components/tableType/DataTable';

export const Admin = () => {
  const [data, setData] = useState([]);

  return (
    <div>
      <CSVUploader onDataLoaded={setData} />
      {data.length > 0 && <DataTable data={data} />}
    </div>
  );
};
