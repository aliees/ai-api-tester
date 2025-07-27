import React, { useState, useEffect } from 'react';

interface TestSuiteBuilderProps {
  suiteToEdit: any | null;
  onSuiteSaved: () => void;
}

const TestSuiteBuilder: React.FC<TestSuiteBuilderProps> = ({ suiteToEdit, onSuiteSaved }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [testCases, setTestCases] = useState<any[]>([]);

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
        instruction: '',
      },
    ]);
  };

  const handleTestCaseChange = (index: number, field: string, value: any) => {
    const newTestCases = [...testCases];
    newTestCases[index][field] = value;
    setTestCases(newTestCases);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      if (!res.ok) {
        throw new Error('Failed to save test suite.');
      }

      onSuiteSaved();
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Test Suite Builder</h2>
      <label>
        Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>
      <label>
        Description:
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <h3>Test Cases</h3>
      {testCases.map((tc, index) => (
        <div key={index} className="test-case-builder">
          <h4>Test Case #{tc.sequence}</h4>
          <label>
            Description:
            <input
              type="text"
              value={tc.description}
              onChange={(e) => handleTestCaseChange(index, 'description', e.target.value)}
            />
          </label>
          <label>
            URL:
            <input
              type="text"
              value={tc.url}
              onChange={(e) => handleTestCaseChange(index, 'url', e.target.value)}
              required
            />
          </label>
          <label>
            Method:
            <select
              value={tc.method}
              onChange={(e) => handleTestCaseChange(index, 'method', e.target.value)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </label>
          <label>
            Headers (JSON):
            <textarea
              value={tc.headers}
              onChange={(e) => handleTestCaseChange(index, 'headers', e.target.value)}
            />
          </label>
          <label>
            Body (JSON):
            <textarea
              value={tc.body}
              onChange={(e) => handleTestCaseChange(index, 'body', e.target.value)}
            />
          </label>
          <label>
            Expected Status:
            <input
              type="number"
              value={tc.expectedStatus}
              onChange={(e) =>
                handleTestCaseChange(index, 'expectedStatus', parseInt(e.target.value, 10))
              }
              required
            />
          </label>
          <div className="instruction-builder">
            <h4>Extraction</h4>
            <label>
              Extract From:
              <select
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
            </label>
            <label>
              Path (JSONPath):
              <input
                type="text"
                placeholder="$.id"
                value={JSON.parse(tc.instruction || '{}').extract?.path || ''}
                onChange={(e) => {
                  const instruction = JSON.parse(tc.instruction || '{}');
                  if (!instruction.extract) instruction.extract = {};
                  instruction.extract.path = e.target.value;
                  handleTestCaseChange(index, 'instruction', JSON.stringify(instruction));
                }}
              />
            </label>
            <label>
              Variable Name:
              <input
                type="text"
                placeholder="userId"
                value={JSON.parse(tc.instruction || '{}').extract?.as || ''}
                onChange={(e) => {
                  const instruction = JSON.parse(tc.instruction || '{}');
                  if (!instruction.extract) instruction.extract = {};
                  instruction.extract.as = e.target.value;
                  handleTestCaseChange(index, 'instruction', JSON.stringify(instruction));
                }}
              />
            </label>
          </div>
        </div>
      ))}

      <button type="button" onClick={handleAddTestCase}>
        Add Test Case
      </button>
      <button type="submit">Save Test Suite</button>
    </form>
  );
};

export default TestSuiteBuilder;