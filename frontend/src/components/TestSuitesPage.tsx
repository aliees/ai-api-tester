import React, { useState } from 'react';
import TestSuites from './test-suites/TestSuites';
import TestSuiteBuilder from './test-suites/TestSuiteBuilder';

import ResultsDisplay from './ResultsDisplay';

const TestSuitesPage: React.FC = () => {
  const [editingSuite, setEditingSuite] = useState<any | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [response, setResponse] = useState<any[] | null>(null);
  const [report, setReport] = useState<any | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  const handleSuiteSaved = () => {
    setEditingSuite(null);
    setRefreshKey(oldKey => oldKey + 1);
  };

  const handleRunTests = (results: any[]) => {
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
    setLogs(currentLogs => [
      ...currentLogs,
      { message: 'Test suite completed!', type: 'success' },
    ]);
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
    <div className="test-suites-page">
      <div className="left-column">
        <div className="card">
          <TestSuites onRunTests={handleRunTests} onEditSuite={setEditingSuite} refreshKey={refreshKey} />
        </div>
        <div className="card">
          <TestSuiteBuilder suiteToEdit={editingSuite} onSuiteSaved={handleSuiteSaved} />
        </div>
      </div>
      <div className="right-column">
        <ResultsDisplay
          response={response}
          report={report}
          logs={logs}
          handleDownloadReport={handleDownloadReport}
          handleDownloadHtmlReport={handleDownloadHtmlReport}
        />
      </div>
    </div>
  );
};

export default TestSuitesPage;