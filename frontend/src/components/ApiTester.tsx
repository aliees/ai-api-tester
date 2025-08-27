import React, { useState } from 'react';
import ApiForm from './ApiForm';
import ResultsDisplay from './ResultsDisplay';

const ApiTester: React.FC = () => {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testCases, setTestCases] = useState<any[]>([]);
  const [securityAnalysis, setSecurityAnalysis] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [report] = useState<any>(null);
  const [, setHeaders] = useState<string>('');

  const handleSendRequest = async (data: {
    url: string;
    method: string;
    headers: string;
    body: string;
    numTestCases: number;
    description: string;
  }) => {
    setLoading(true);
    setLogs(() => [{ message: 'Generating test cases...', type: 'info' }]);
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

      const newTestCases = responseData.testCases.map((tc: any) => ({ ...tc, headers: data.headers }));
      setTestCases(newTestCases);
      setResponse(newTestCases);
      setHeaders(data.headers);
      setSecurityAnalysis(responseData.securityAnalysis || null);
      setRecommendations(responseData.recommendations || null);
      setLogs(currentLogs => [
        ...currentLogs,
        { message: 'Test cases generated successfully!', type: 'success' },
      ]);
    } catch (error: any) {
      setTestCases([]); // Clear old test cases on error
      setLogs(currentLogs => [
        ...currentLogs,
        { message: error.message, type: 'error' },
      ]);
    } finally {
      setLoading(false);
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

  const handleDownloadHtmlReport = async () => {
    if (response && report) {
      const res = await fetch('http://localhost:3001/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testCases: response, report }),
      });
      const html = await res.text();
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'test_report.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="App">
      <header>
        <h1>AI-Powered API Tester</h1>
      </header>
      <main>
        <ApiForm onSendRequest={handleSendRequest} onFileLoaded={setTestCases} loading={loading} />
        {loading ? (
          <div className="card">
            <div className="loader-container">
              <div className="loader"></div>
            </div>
          </div>
        ) : null}
        <ResultsDisplay
          response={response}
          testCases={testCases}
          report={report}
          logs={logs}
          handleDownloadReport={handleDownloadReport}
          handleDownloadHtmlReport={handleDownloadHtmlReport}
        />
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
      </main>
    </div>
  );
};

export default ApiTester;