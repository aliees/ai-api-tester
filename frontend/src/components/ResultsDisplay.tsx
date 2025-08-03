import React from 'react';
import ReportCard from './ReportCard';
import ExecutionLogs from './ExecutionLogs';
import ResponseAccordion from './ResponseAccordion';
import PayloadAccordion from './PayloadAccordion';
import { generateCurl } from '../utils';

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
  if (response) {
    console.log('Test Results:', response);
  }

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
              <button
                className="copy-curl-button"
                onClick={() => {
                  console.log('Result object for cURL:', result);
                  navigator.clipboard.writeText(generateCurl(result));
                }}
              >
                Copy cURL
              </button>
              <div className="details-grid">
                <div><span>URL</span><p>{result.url}</p></div>
                <div><span>Method</span><p><strong>{result.method}</strong></p></div>
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
                <PayloadAccordion payload={result.payload} />
              )}
              <ResponseAccordion response={result.response || result.error} />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ResultsDisplay;