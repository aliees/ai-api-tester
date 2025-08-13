import React, { useState } from 'react';

interface CurlImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (curlCommand: string) => void;
}

const CurlImportModal: React.FC<CurlImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [curlCommand, setCurlCommand] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleImport = () => {
    onImport(curlCommand);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Import from cURL</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          <textarea
            value={curlCommand}
            onChange={(e) => setCurlCommand(e.target.value)}
            placeholder="Paste your cURL command here..."
          />
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="secondary">Cancel</button>
          <button onClick={handleImport}>Import</button>
        </div>
      </div>
    </div>
  );
};

export default CurlImportModal;