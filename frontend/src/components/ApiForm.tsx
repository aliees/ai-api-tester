import React, { useState } from 'react';
import CsvUpload from './CsvUpload';

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
}

const ApiForm: React.FC<ApiFormProps> = ({ onSendRequest, onFileLoaded, loading }) => {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('');
  const [body, setBody] = useState('');
  const [numTestCases, setNumTestCases] = useState(5);
  const [description, setDescription] = useState('');

  const parseCurl = (curl: string) => {
    const parts = curl.match(/'[^']*'|"[^"]*"|\S+/g) || [];
    let url = parts[1] || '';
    let method = 'GET';
    const headers: { [key: string]: string } = {};
    let body = '';

    for (let i = 2; i < parts.length; i++) {
      switch (parts[i]) {
        case '-X':
        case '--request':
          method = parts[++i];
          break;
        case '--header':
          const header = parts[++i].replace(/'/g, '');
          const [key, value] = header.split(': ');
          headers[key] = value;
          break;
        case '--data-raw':
          body = parts[++i].replace(/'/g, '');
          break;
      }
    }

    setUrl(url);
    setMethod(method);
    setHeaders(JSON.stringify(headers, null, 2));
    setBody(body);
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
        <textarea
          id="headers"
          value={headers}
          onChange={(e) => setHeaders(e.target.value)}
          placeholder='{ "Authorization": "Bearer YOUR_TOKEN" }'
        />

        <label htmlFor="body">Request Body (JSON)</label>
        <textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder='{ "key": "value" }'
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

        <div className="button-group">
          <CsvUpload onFileLoaded={onFileLoaded} />
          <button type="button" onClick={() => {
            const curl = prompt('Paste your cURL command:');
            if (curl) {
              parseCurl(curl);
            }
          }} className="secondary">
            Import from cURL
          </button>
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? <div className="loader" /> : 'Generate Test Cases'}
        </button>
      </form>
    </div>
  );
};

export default ApiForm;