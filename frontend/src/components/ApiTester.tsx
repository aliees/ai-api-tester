import React, { useState } from 'react';
import ApiForm from './ApiForm';
import TestCasesList from './TestCasesList';
import ExecutionLogs from './ExecutionLogs';
import ReportCard from './ReportCard';

const ApiTester: React.FC = () => {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testCases, setTestCases] = useState<any[]>([]);
  const [securityAnalysis, setSecurityAnalysis] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [runningTests, setRunningTests] = useState(false);
  const [headers, setHeaders] = useState<string>('');

  const handleSendRequest = async (data: {
    url: string;
    method: string;
    headers: string;
    body: string;
    numTestCases: number;
    description: string;
  }) => {
    setLoading(true);
    setLogs([{ message: 'Generating test cases...', type: 'info' }]);
    try {
      const res = await fetch('http://localhost:3001/generate-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const responseData = await res.json();

      if (!res.ok || responseData.error) {
        throw new Error(responseData.error || 'Failed to generate test cases from the server.');
      }

      if (!responseData.testCases || !Array.isArray(responseData.testCases)) {
        throw new Error('Received an invalid format for test cases.');
      }

      setTestCases(responseData.testCases);
      setHeaders(data.headers);
      setSecurityAnalysis(responseData.securityAnalysis || null);
      setRecommendations(responseData.recommendations || null);
      setLogs((prevLogs) => [
        ...prevLogs,
        { message: 'Test cases generated successfully!', type: 'success' },
      ]);
    } catch (error: any) {
      setTestCases([]); // Clear old test cases on error
      setLogs((prevLogs) => [
        ...prevLogs,
        { message: error.message, type: 'error' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRunTests = async () => {
    setRunningTests(true);
    setLogs((prevLogs) => [...prevLogs, { message: 'Running tests...', type: 'info' }]);
    try {
      const testCasesWithHeaders = testCases.map(tc => ({ ...tc, headers }));
      const res = await fetch('http://localhost:3001/run-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testCases: testCasesWithHeaders }),
      });
      const results = await res.json();
      setResponse(results);
      const passed = results.filter((r: any) => r.passed).length;
      const failed = results.length - passed;
      const averageResponseTime =
        results.reduce((acc: number, r: any) => acc + r.responseTime, 0) /
        results.length;
      setReport({
        totalTests: results.length,
        passed,
        failed,
        averageResponseTime,
      });
      setLogs((prevLogs) => [
        ...prevLogs,
        { message: 'Tests completed!', type: 'success' },
      ]);
    } catch (error) {
      setLogs((prevLogs) => [
        ...prevLogs,
        { message: 'Failed to run tests.', type: 'error' },
      ]);
    } finally {
      setRunningTests(false);
    }
  };

  const handleDownloadReport = () => {
    if (response) {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(response, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "test_report.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  };

  return (
    <div className="App">
      <header>
        <h1>AI-Powered API Tester</h1>
      </header>
      <main>
        <div className="left-column">
          <div className="card">
            <ApiForm onSendRequest={handleSendRequest} onFileLoaded={setTestCases} loading={loading} />
          </div>
          <div className="card">
            <ExecutionLogs logs={logs} />
          </div>
        </div>
        <div className="right-column">
          <div className="card">
            {loading ? (
              <div className="loader-container">
                <div className="loader"></div>
              </div>
            ) : (
              <TestCasesList
                testCases={testCases}
                onRunTests={handleRunTests}
                runningTests={runningTests}
              />
            )}
          </div>
          {report && (
            <div className="card">
              <ReportCard report={report} onDownload={handleDownloadReport} />
            </div>
          )}
          {response && (
            <div className="card">
              <h2>Test Results</h2>
              {response.map((result: any, index: number) => (
                <div key={index} className={`test-result ${result.passed ? 'passed' : 'failed'}`}>
                  <h3>{result.description}</h3>
                  <div className="test-result-details">
                    <span><strong>URL:</strong> {result.url}</span>
                    <span><strong>Status:</strong> {result.status || 'N/A'}</span>
                    <span><strong>Response Time:</strong> {result.responseTime}ms</span>
                  </div>
                  {result.headers && (
                    <>
                      <h4>Headers:</h4>
                      <pre>
                        <code>{JSON.stringify(result.headers, null, 2)}</code>
                      </pre>
                    </>
                  )}
                  {result.payload && (
                    <>
                      <h4>Payload:</h4>
                      <pre>
                        <code>{JSON.stringify(result.payload, null, 2)}</code>
                      </pre>
                    </>
                  )}
                  <h4>Response:</h4>
                  <pre>
                    <code>{JSON.stringify(result.response || result.error, null, 2)}</code>
                  </pre>
                </div>
              ))}
            </div>
          )}
          {securityAnalysis && (
            <div className="card">
              <h2>Security Analysis</h2>
              <p>{securityAnalysis}</p>
            </div>
          )}
          {recommendations && (
            <div className="card">
              <h2>Recommendations</h2>
              <p>{recommendations}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ApiTester;