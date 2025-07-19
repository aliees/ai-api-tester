import React, { useState } from 'react';

interface ApiFormProps {
  onSendRequest: (data: {
    url: string;
    method: string;
    headers: string;
    body: string;
    numTestCases: number;
    description: string;
  }) => void;
  loading: boolean;
}

const ApiForm: React.FC<ApiFormProps> = ({ onSendRequest, loading }) => {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('');
  const [body, setBody] = useState('');
  const [numTestCases, setNumTestCases] = useState(5);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendRequest({ url, method, headers, body, numTestCases, description });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>API Request</h2>
      <label>
        URL:
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
      </label>
      <label>
        Method:
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </label>
      <label>
        Headers (JSON):
        <textarea
          value={headers}
          onChange={(e) => setHeaders(e.target.value)}
        />
      </label>
      <label>
        Body (JSON):
        <textarea value={body} onChange={(e) => setBody(e.target.value)} />
      </label>
      <label>
        Number of Test Cases:
        <input
          type="number"
          value={numTestCases}
          onChange={(e) => setNumTestCases(parseInt(e.target.value, 10))}
          min="1"
          max="20"
        />
      </label>
      <label>
        API Description:
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Loading...' : 'Send Request'}
      </button>
    </form>
  );
};

export default ApiForm;