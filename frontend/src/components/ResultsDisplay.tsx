import React from 'react';
import ReportCard from './ReportCard';
import ExecutionLogs from './ExecutionLogs';

interface ResultsDisplayProps {
  response: any[] | null;
  report: any | null;
  logs: any[];
  handleDownloadReport: () => void;
  handleDownloadHtmlReport: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  response,
  report,
  logs,
  handleDownloadReport,
  handleDownloadHtmlReport,
}) => {
  return (
    <>
      <div className="card">
        <ExecutionLogs logs={logs} />
      </div>
      {report && (
        <div className="card">
          <ReportCard
            report={report}
            onDownload={handleDownloadReport}
            onDownloadHtml={handleDownloadHtmlReport}
          />
        </div>
      )}
      {response && (
        <div className="card">
          <h2>Test Results</h2>
          {response.map((result: any, index: number) => (
            <div key={index} className={`test-result ${result.passed ? 'passed' : 'failed'}`}>
              <h3>
                <span className={result.passed ? 'text-success' : 'text-error'}>
                  {result.passed ? 'PASS' : 'FAIL'}
                </span>
                {result.description}
              </h3>
              <div className="details-grid">
                <div><span>URL</span><p>{result.url}</p></div>
                <div><span>Status</span><p>{result.status || 'N/A'}</p></div>
                <div><span>Time</span><p>{result.responseTime}ms</p></div>
              </div>
              
              {result.headers && (
                <>
                  <h4>Headers</h4>
                  <pre>{JSON.stringify(result.headers, null, 2)}</pre>
                </>
              )}
              {result.payload && (
                <>
                  <h4>Payload</h4>
                  <pre>{JSON.stringify(result.payload, null, 2)}</pre>
                </>
              )}
              <h4>Response</h4>
              <pre>{JSON.stringify(result.response || result.error, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ResultsDisplay;