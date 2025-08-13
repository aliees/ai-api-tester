import React, { useState, useEffect } from 'react';
import CurlImportModal from '../modals/CurlImportModal';

interface TestSuiteBuilderProps {
  suiteToEdit: any | null;
  onSuiteSaved: () => void;
}

const TestSuiteBuilder: React.FC<TestSuiteBuilderProps> = ({ suiteToEdit, onSuiteSaved }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [testCases, setTestCases] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isCurlModalOpen, setIsCurlModalOpen] = useState(false);
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState<number | null>(null);

  useEffect(() => {
    if (suiteToEdit) {
      setName(suiteToEdit.name);
      setDescription(suiteToEdit.description);
      setTestCases(suiteToEdit.testCases || []);
    } else {
      setName('');
      setDescription('');
      setTestCases([]);
    }
  }, [suiteToEdit]);

  const handleAddTestCase = () => {
    setTestCases([
      ...testCases,
      {
        sequence: testCases.length + 1,
        description: '',
        url: '',
        method: 'GET',
        headers: '',
        body: '',
        expectedStatus: 200,
        instruction: '{"extract":{"from":"body"}}',
      },
    ]);
  };

  const handleImportFromCurl = (curlCommand: string, index: number) => {
    if (curlCommand) {
      try {
        const urlRegex = /'([^']*)'/;
        const urlMatch = curlCommand.match(urlRegex);
        let url = '';
        if (urlMatch) {
          url = urlMatch[1];
        }
        
        let method = 'GET';
        const methodRegex = /(?:-X|--request)\s+([A-Z]+)/;
        const methodMatch = curlCommand.match(methodRegex);
        if (methodMatch) {
          method = methodMatch[1];
        } else if (curlCommand.includes('--data-raw')) {
          method = 'POST';
        }

        const headersRegex = /(?:-H|--header)\s+'([^']*)'/g;
        const headersObject: { [key: string]: string } = {};
        let match;
        while ((match = headersRegex.exec(curlCommand)) !== null) {
          const [key, value] = match[1].split(/:\s*/);
          headersObject[key] = value;
        }
        const headers = JSON.stringify(headersObject, null, 2);

        let body = '';
        const bodyRegex = /--data-raw\s+'([^']*)'/;
        const bodyMatch = curlCommand.match(bodyRegex);
        if (bodyMatch) {
          body = bodyMatch[1];
        }

        const newTestCases = [...testCases];
        const tc = newTestCases[index];
        tc.url = url || tc.url;
        tc.method = method || tc.method;
        tc.headers = headers || tc.headers;
        tc.body = body || tc.body;
        setTestCases(newTestCases);
      } catch (error) {
        console.error('Failed to parse cURL command:', error);
        alert('Failed to parse cURL command. Please check the format.');
      }
    }
  };

  const handleTestCaseChange = (index: number, field: string, value: any) => {
    const newTestCases = [...testCases];
    newTestCases[index][field] = value;
    setTestCases(newTestCases);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const token = localStorage.getItem('token');
    const url = suiteToEdit
      ? `http://localhost:3001/api/test-suites/${suiteToEdit.id}`
      : 'http://localhost:3001/api/test-suites';
    const method = suiteToEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description, testCases }),
      });

      console.log('Saving Test Cases:', testCases);

      if (!res.ok) {
        throw new Error('Failed to save test suite.');
      }

      onSuiteSaved();
    } catch (error) {
      // Handle error
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card">
      <h2>{suiteToEdit ? 'Edit Test Suite' : 'Create Test Suite'}</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="suiteName">Suite Name</label>
        <input
          id="suiteName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., User API Tests"
          required
        />

        <label htmlFor="suiteDescription">Description</label>
        <textarea
          id="suiteDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A collection of tests for the user endpoint."
        />

        <h3>Test Cases</h3>
        {testCases.map((tc, index) => (
          <div key={index} className="test-case-builder card">
            <h4>Test Case #{tc.sequence}</h4>
            <label htmlFor={`tc-description-${index}`}>Description</label>
            <input
              id={`tc-description-${index}`}
              type="text"
              value={tc.description}
              onChange={(e) => handleTestCaseChange(index, 'description', e.target.value)}
              placeholder="e.g., Get user profile"
            />

            <label htmlFor={`tc-url-${index}`}>URL</label>
            <input
              id={`tc-url-${index}`}
              type="text"
              value={tc.url}
              onChange={(e) => handleTestCaseChange(index, 'url', e.target.value)}
              placeholder="https://api.example.com/users/1"
              required
            />

            <label htmlFor={`tc-method-${index}`}>Method</label>
            <select
              id={`tc-method-${index}`}
              value={tc.method}
              onChange={(e) => handleTestCaseChange(index, 'method', e.target.value)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>

            <label htmlFor={`tc-headers-${index}`}>Headers (JSON)</label>
            <textarea
              id={`tc-headers-${index}`}
              value={tc.headers}
              onChange={(e) => handleTestCaseChange(index, 'headers', e.target.value)}
              placeholder='{ "Authorization": "Bearer YOUR_TOKEN" }'
            />

            <label htmlFor={`tc-body-${index}`}>Body (JSON)</label>
            <textarea
              id={`tc-body-${index}`}
              value={tc.body}
              onChange={(e) => handleTestCaseChange(index, 'body', e.target.value)}
              placeholder='{ "key": "value" }'
            />


            <label htmlFor={`tc-status-${index}`}>Expected Status</label>
            <input
              id={`tc-status-${index}`}
              type="number"
              value={tc.expectedStatus}
              onChange={(e) =>
                handleTestCaseChange(index, 'expectedStatus', parseInt(e.target.value, 10))
              }
              required
            />
            
            <div className="instruction-builder">
              <h5>Data Extraction</h5>
              <label htmlFor={`extract-from-${index}`}>Extract From</label>
              <select
                id={`extract-from-${index}`}
                value={JSON.parse(tc.instruction || '{}').extract?.from || 'body'}
                onChange={(e) => {
                  const instruction = JSON.parse(tc.instruction || '{}');
                  if (!instruction.extract) instruction.extract = {};
                  instruction.extract.from = e.target.value;
                  handleTestCaseChange(index, 'instruction', JSON.stringify(instruction));
                }}
              >
                <option value="body">Response Body</option>
                <option value="header">Response Header</option>
              </select>

              <label htmlFor={`extract-path-${index}`}>Path</label>
              <div className="json-path-input">
                <span>$.</span>
                <input
                  id={`extract-path-${index}`}
                  type="text"
                  placeholder="id"
                  value={(JSON.parse(tc.instruction || '{}').extract?.path || '').substring(2)}
                  onChange={(e) => {
                    const instruction = JSON.parse(tc.instruction || '{"extract":{"from":"body"}}');
                    if (!instruction.extract) instruction.extract = { from: 'body' };
                    instruction.extract.path = e.target.value ? `$.${e.target.value}` : '';
                    if (!instruction.extract.path && !instruction.extract.as) {
                      delete instruction.extract;
                    }
                    handleTestCaseChange(index, 'instruction', JSON.stringify(instruction));
                  }}
                />
              </div>

              <label htmlFor={`extract-as-${index}`}>Variable Name</label>
              <input
                id={`extract-as-${index}`}
                type="text"
                placeholder="userId"
                value={JSON.parse(tc.instruction || '{}').extract?.as || ''}
                onChange={(e) => {
                  const instruction = JSON.parse(tc.instruction || '{"extract":{"from":"body"}}');
                  if (!instruction.extract) instruction.extract = { from: 'body' };
                  instruction.extract.as = e.target.value;
                  if (!instruction.extract.path && !instruction.extract.as) {
                    delete instruction.extract;
                  }
                  handleTestCaseChange(index, 'instruction', JSON.stringify(instruction));
                }}
              />
            </div>
            <div className="button-group">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTestCaseIndex(index);
                    setIsCurlModalOpen(true);
                  }}
                  className="secondary"
                >
                  Import from cURL
                </button>
            </div>
          </div>
        ))}
        
        <div className="button-group">
          <button type="button" onClick={handleAddTestCase} className="secondary">
            Add Test Case
          </button>
          <button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Test Suite'}
          </button>
        </div>
     </form>
     <CurlImportModal
       isOpen={isCurlModalOpen}
       onClose={() => setIsCurlModalOpen(false)}
       onImport={(curlCommand) => {
         if (activeTestCaseIndex !== null) {
           handleImportFromCurl(curlCommand, activeTestCaseIndex);
         }
         setIsCurlModalOpen(false);
       }}
     />
   </div>
 );
};

export default TestSuiteBuilder;