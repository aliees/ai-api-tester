import React, { useState, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import CsvUpload from './CsvUpload';
import CurlImportModal from './modals/CurlImportModal';

interface ApiFormProps {
  onSendRequest: (data: {
    url: string;
    method: string;
    headers: string;
    body: string;
    numTestCases: number;
    description: string;
  }) => void;
  onFileLoaded: (data: any[]) => void;
  loading: boolean;
  showAiPayloadGenerator?: boolean;
  onApiDetailsChange: (details: {
    url: string;
    method: string;
    headers: string;
    body: string;
    numTestCases: number;
    description: string;
  }) => void;
  onGenerateAiPayloads: () => void;
}

const ApiForm: React.FC<ApiFormProps> = ({ onSendRequest, onFileLoaded, loading, showAiPayloadGenerator = false, onApiDetailsChange, onGenerateAiPayloads }) => {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('');
  const [body, setBody] = useState('');
  const [numTestCases, setNumTestCases] = useState(5);
  const [description, setDescription] = useState('');
  const [isCurlModalOpen, setIsCurlModalOpen] = useState(false);

  // Notify parent component of state changes
  useEffect(() => {
    onApiDetailsChange({ url, method, headers, body, numTestCases, description });
  }, [url, method, headers, body, numTestCases, description, onApiDetailsChange]);

  const parseCurlCommand = (curlCommand: string) => {
    if (curlCommand) {
      try {
        const urlRegex = /'([^']*)'/;
        const urlMatch = curlCommand.match(urlRegex);
        if (urlMatch) {
          setUrl(urlMatch[1]);
        }
        
        const methodRegex = /(?:-X|--request)\s+([A-Z]+)/;
        const methodMatch = curlCommand.match(methodRegex);
        if (methodMatch) {
          setMethod(methodMatch[1]);
        } else if (curlCommand.includes('--data-raw')) {
          setMethod('POST');
        }

        const headersRegex = /(?:-H|--header)\s+'([^']*)'/g;
        const headersObject: { [key: string]: string } = {};
        let match;
        while ((match = headersRegex.exec(curlCommand)) !== null) {
          const [key, value] = match[1].split(/:\s*/);
          headersObject[key] = value;
        }
        setHeaders(JSON.stringify(headersObject, null, 2));

        const dataRawIndex = curlCommand.indexOf('--data-raw');
        if (dataRawIndex !== -1) {
          let bodyStr = curlCommand.substring(dataRawIndex + '--data-raw'.length).trim();
          if ((bodyStr.startsWith("'") && bodyStr.endsWith("'")) || (bodyStr.startsWith('"') && bodyStr.endsWith('"'))) {
            bodyStr = bodyStr.substring(1, bodyStr.length - 1);
          }
          setBody(bodyStr);
        }
      } catch (error) {
        console.error('Failed to parse cURL command:', error);
        alert('Invalid cURL command.');
      }
    }
  };
 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendRequest({ url, method, headers, body, numTestCases, description });
  };
 
  return (
    <div className="card">
      <h2>API Test Case Generation</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="url">API Endpoint URL</label>
        <input
          id="url"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/data"
          required
        />

        <label htmlFor="method">HTTP Method</label>
        <select id="method" value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>

        <label htmlFor="headers">Headers (JSON)</label>
        <TextareaAutosize
          id="headers"
          value={headers}
          onChange={(e) => setHeaders(e.target.value)}
          placeholder='{ "Authorization": "Bearer YOUR_TOKEN" }'
          minRows={2}
        />

        <label htmlFor="body">Request Body (JSON)</label>
        <TextareaAutosize
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder='{ "key": "value" }'
          minRows={3}
        />


        <label htmlFor="numTestCases">Number of Test Cases</label>
        <input
          id="numTestCases"
          type="number"
          value={numTestCases}
          onChange={(e) => setNumTestCases(parseInt(e.target.value, 10))}
          min="1"
          max="20"
        />

        <label htmlFor="description">API Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Fetch user data"
        />

        <div className="button-group" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <CsvUpload onFileLoaded={onFileLoaded} />
          <div className="curl-import">
            {/* <label>Import from cURL</label> */}
            <button type="button" onClick={() => setIsCurlModalOpen(true)}>Import Curl</button>
          </div>
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? <div className="loader" /> : 'Generate Test Cases'}
        </button>
        {/* {showAiPayloadGenerator && (
          <button type="button" onClick={onGenerateAiPayloads} disabled={loading}>
            Generate AI Payloads
          </button>
        )} */}
      </form>
      <CurlImportModal
        isOpen={isCurlModalOpen}
        onClose={() => setIsCurlModalOpen(false)}
        onImport={parseCurlCommand}
      />
    </div>
  );
};

export default ApiForm;