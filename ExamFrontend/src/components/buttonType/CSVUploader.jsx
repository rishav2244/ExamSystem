import { useCSVReader } from 'react-papaparse';

export const CSVUploader = ({ onDataLoaded }) => {
  const { CSVReader } = useCSVReader();

  return (
    <CSVReader
      onUploadAccepted={(results) => {
        console.log('CSV Results:', results);
        onDataLoaded(results.data);
      }}
    >
      {({ getRootProps, acceptedFile, getRemoveFileProps }) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button type="button" {...getRootProps()}>
            Browse file
          </button>

          <div
            style={{
              border: '1px solid #ccc',
              height: 45,
              lineHeight: '45px',
              paddingLeft: 13,
              width: '60%',
            }}
          >
            {acceptedFile?.name || 'No file selected'}
          </div>

          <button type="button" {...getRemoveFileProps()}>
            Remove
          </button>
        </div>
      )}
    </CSVReader>
  );
};
