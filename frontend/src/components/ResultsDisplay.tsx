import React, { createRef, useState } from 'react';
import ReportCard from './ReportCard';
import ExecutionLogs from './ExecutionLogs';
import ResponseAccordion from './ResponseAccordion';
import PayloadAccordion from './PayloadAccordion';
import { generateCurl } from '../utils';

interface ResultsDisplayProps {
  response: any[] | null;
  testCases?: any[] | null;
  report: any | null;
  logs: any[];
  handleDownloadReport: () => void;
  handleDownloadHtmlReport: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  response,
  report,
  testCases,
  logs,
  handleDownloadReport,
  handleDownloadHtmlReport,
}) => {
  const testResultRefs = React.useRef<React.RefObject<HTMLDivElement>[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (response) {
    testResultRefs.current = response.map(
      (_, i) => testResultRefs.current[i] ?? createRef()
    );
  }

  const scrollToTestResult = (index: number) => {
    testResultRefs.current[index].current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <>
      {testCases && testCases.length > 0 && (
        <div className="card">
          <h2>AI-Generated Test Cases</h2>
          <table className="test-cases-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Description</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Method</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>URL</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Payload</th>
              </tr>
            </thead>
            <tbody>
              {testCases.map((tc: any, index: number) => (
                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '8px' }}>{tc.description}</td>
                  <td style={{ padding: '8px' }}>{tc.method}</td>
                  <td style={{ padding: '8px' }}>{tc.url}</td>
                  <td style={{ padding: '8px' }}>
                    <pre>{JSON.stringify(tc.payload, null, 2)}</pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
          {response.some(r => !r.passed) && (
            <div className="failed-summary">
              <h4>Failed Tests</h4>
              <ul>
                {response
                  .map((result, index) => ({ result, index }))
                  .filter(({ result }) => !result.passed)
                  .map(({ result, index }) => (
                    <li key={index}>
                      <a
                        href={`#test-result-${index}`}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToTestResult(index);
                        }}
                      >
                        {result.description}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          )}
          {response.map((result: any, index: number) => (
            <div
              key={index}
              id={`test-result-${index}`}
              ref={testResultRefs.current[index]}
              className={`test-result ${result.passed ? 'passed' : 'failed'}`}
            >
              <div
                className="test-result-header"
                onClick={() => handleToggle(index)}
                style={{ cursor: 'pointer' }}
              >
                <h3>
                  <span className={result.passed ? 'text-success' : 'text-error'}>
                    {result.passed ? 'PASS' : 'FAIL'}
                  </span>{' '}
                  {result.description}
                </h3>
              </div>
              {expandedIndex === index && (
                <>
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
                    <div>
                      <span>URL</span>
                      <p>{result.url}</p>
                    </div>
                    <div>
                      <span>Method</span>
                      <p>
                        <strong>{result.method}</strong>
                      </p>
                    </div>
                    <div>
                      <span>Status</span>
                      <p>{result.status || 'N/A'}</p>
                    </div>
                    <div>
                      <span>Time</span>
                      <p>{result.responseTime}ms</p>
                    </div>
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
                  <ResponseAccordion
                    response={result.response || result.error}
                  />
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ResultsDisplay;