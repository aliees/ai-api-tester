import React from 'react';
import Papa from 'papaparse';

interface CsvUploadProps {
  onFileLoaded: (data: any[]) => void;
}

const CsvUpload: React.FC<CsvUploadProps> = ({ onFileLoaded }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      Papa.parse(e.target.files[0], {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          onFileLoaded(results.data);
        },
      });
    }
  };

  return (
    <div>
      <label>
        Upload CSV:
        <input type="file" accept=".csv" onChange={handleFileChange} />
      </label>
    </div>
  );
};

export default CsvUpload;