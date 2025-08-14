import React from 'react';
import './TestSuiteCard.css';

interface TestSuite {
  id: number;
  name: string;
  testCases?: { id: number; method: string; url: string }[];
  testCaseCount: number;
}

interface TestSuiteCardProps {
  suite: TestSuite;
  isExpanded: boolean;
  onToggleExpand: (suiteId: number) => void;
  onRunSuite: (suiteId: number) => void;
  onEditSuite: (suite: TestSuite) => void;
  onDeleteSuite: (suiteId: number) => void;
  runningSuiteId: number | null;
}

const TestSuiteCard: React.FC<TestSuiteCardProps> = ({
  suite,
  isExpanded,
  onToggleExpand,
  onRunSuite,
  onEditSuite,
  onDeleteSuite,
  runningSuiteId,
}) => {
  return (
    <div className="test-suite-card">
      <div className="card-header">
        <div className="suite-info">
          <h3>{suite.name}</h3>
          <span>{suite.testCaseCount} APIs</span>
        </div>
        <div className="suite-actions">
          <button onClick={() => onToggleExpand(suite.id)}>
            {isExpanded ? 'Hide Details' : 'View Details'}
          </button>
          <button onClick={() => onRunSuite(suite.id)} disabled={runningSuiteId === suite.id}>
            {runningSuiteId === suite.id ? 'Running...' : 'Run'}
          </button>
          <button onClick={() => onEditSuite(suite)}>Edit</button>
          <button onClick={() => onDeleteSuite(suite.id)} className="danger">
            Delete
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="card-body">
          <div className="test-cases-list">
            {suite.testCases && suite.testCases.length > 0 ? (
              suite.testCases.map((tc) => (
                <div key={tc.id} className="test-case-item">
                  <strong>{tc.method}</strong> {tc.url}
                </div>
              ))
            ) : (
              <p>Loading details or no test cases in this suite...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestSuiteCard;