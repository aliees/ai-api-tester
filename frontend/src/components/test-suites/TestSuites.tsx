import React, { useState, useEffect } from 'react';

interface TestSuitesProps {
  onRunTests: (testCases: any[]) => void;
  onEditSuite: (suite: any) => void;
}

const TestSuites: React.FC<TestSuitesProps> = ({ onRunTests, onEditSuite }) => {
  const [testSuites, setTestSuites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSuiteId, setActiveSuiteId] = useState<number | null>(null);

  useEffect(() => {
    const fetchTestSuites = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3001/api/test-suites', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch test suites.');
        }

        const data = await res.json();
        setTestSuites(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTestSuites();
  }, []);

  const handleRunSuite = async (suiteId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3001/api/test-suites/${suiteId}/run`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to run test suite.');
      }

      const results = await res.json();
      onRunTests(results);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleSuite = async (suiteId: number) => {
    if (activeSuiteId === suiteId) {
      setActiveSuiteId(null);
    } else {
      setActiveSuiteId(suiteId);
      // Fetch full suite details if not already loaded
      const suite = testSuites.find(s => s.id === suiteId);
      if (!suite.testCases) {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3001/api/test-suites/${suiteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTestSuites(testSuites.map(s => s.id === suiteId ? data : s));
      }
    }
  };

  return (
    <div>
      <h2>Test Suites</h2>
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="accordion">
          {testSuites.map((suite) => (
            <div key={suite.id} className="accordion-item">
              <div className="accordion-header">
                {suite.name}
                {activeSuiteId === suite.id ? (
                  <button onClick={() => toggleSuite(suite.id)}>Close</button>
                ) : (
                  <button onClick={() => toggleSuite(suite.id)}>View Details</button>
                )}
              </div>
              {activeSuiteId === suite.id && (
                <div className="accordion-body">
                  {suite.testCases && suite.testCases.map((tc: any) => (
                    <div key={tc.id} className="test-case-summary">
                      <strong>{tc.method}</strong> {tc.url}
                    </div>
                  ))}
                  <button onClick={() => handleRunSuite(suite.id)}>Run</button>
                  <button onClick={() => onEditSuite(suite)}>Edit</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestSuites;