import React from 'react';
import Papa from 'papaparse';
import './CsvUpload.css';

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
    <div className="csv-upload">
      <label htmlFor="csv-input" className="csv-upload-label">
        Upload Test Cases (CSV)
      </label>
      <input
        id="csv-input"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default CsvUpload;