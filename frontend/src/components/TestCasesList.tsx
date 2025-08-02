import React from 'react';

interface TestCase {
  description: string;
  method: string;
  url: string;
  body: any;
  expectedStatus: number;
  instruction?: string;
}

interface TestCasesListProps {
  testCases: TestCase[];
  onRunTests: () => void;
  runningTests: boolean;
}

const TestCasesList: React.FC<TestCasesListProps> = ({
  testCases,
  onRunTests,
  runningTests,
}) => {
  return (
    <div className="card">
      <h2>Generated Test Cases</h2>
      <div className="button-group">
        <button onClick={onRunTests} disabled={runningTests || testCases.length === 0}>
          {runningTests ? <div className="loader" /> : 'Run All Tests'}
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Method</th>
            <th>URL</th>
            <th>Body</th>
            <th>Expected Status</th>
            <th>Instruction</th>
          </tr>
        </thead>
        <tbody>
          {testCases.map((testCase, index) => (
            <tr key={index}>
              <td>{testCase.description}</td>
              <td>{testCase.method}</td>
              <td>{testCase.url}</td>
              <td>
                <pre>{JSON.stringify(testCase.body, null, 2)}</pre>
              </td>
              <td>{testCase.expectedStatus}</td>
              <td>{testCase.instruction}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TestCasesList;