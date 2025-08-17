import React, { useState, useEffect } from 'react';
import TestSuiteCard from './TestSuiteCard';

interface TestSuitesProps {
  onRunTests: (testCases: any[]) => void;
  onEditSuite: (suite: any) => void;
  refreshKey: number;
  setIsLoading: (loading: boolean) => void;
}

const TestSuites: React.FC<TestSuitesProps> = ({ onRunTests, onEditSuite, refreshKey, setIsLoading }) => {
  const [testSuites, setTestSuites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSuiteId, setActiveSuiteId] = useState<number | null>(null);
  const [runningSuiteId, setRunningSuiteId] = useState<number | null>(null);
  const [editingSuiteId, setEditingSuiteId] = useState<number | null>(null);

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

  useEffect(() => {
    fetchTestSuites();
  }, [refreshKey]);

  const handleRunSuite = async (suiteId: number) => {
    setRunningSuiteId(suiteId);
    setIsLoading(true);
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
    } finally {
      setRunningSuiteId(null);
      setIsLoading(false);
    }
  };

  const handleEditSuite = (suite: any) => {
    if (editingSuiteId === suite.id) {
      setEditingSuiteId(null);
      onEditSuite(null);
    } else {
      setEditingSuiteId(suite.id);
      onEditSuite(suite);
    }
  };

  const handleDeleteSuite = async (suiteId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3001/api/test-suites/${suiteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to delete test suite.');
      }

      fetchTestSuites();
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
        console.log('Full suite details:', data);
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
        <div>
          {testSuites.map((suite) => (
            <TestSuiteCard
              key={suite.id}
              suite={suite}
              isExpanded={activeSuiteId === suite.id}
              onToggleExpand={toggleSuite}
              onRunSuite={handleRunSuite}
              onEditSuite={handleEditSuite}
              onDeleteSuite={handleDeleteSuite}
              runningSuiteId={runningSuiteId}
              editingSuiteId={editingSuiteId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TestSuites;