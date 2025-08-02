import React from 'react';

interface Report {
  totalTests: number;
  passed: number;
  failed: number;
  averageResponseTime: number;
}

interface ReportCardProps {
  report: Report;
  onDownload: () => void;
  onDownloadHtml: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onDownload, onDownloadHtml }) => {
  return (
    <div className="card">
      <h2>Test Report</h2>
      <div className="report-metrics">
        <div className="metric">
          <span>Total Tests</span>
          <p>{report.totalTests}</p>
        </div>
        <div className="metric">
          <span className="text-success">Passed</span>
          <p className="text-success">{report.passed}</p>
        </div>
        <div className="metric">
          <span className="text-error">Failed</span>
          <p className="text-error">{report.failed}</p>
        </div>
        <div className="metric">
          <span>Avg. Response Time</span>
          <p>{report.averageResponseTime.toFixed(2)}ms</p>
        </div>
      </div>
      <div className="button-group">
        <button onClick={onDownload} className="secondary">Download JSON</button>
        <button onClick={onDownloadHtml}>Download HTML</button>
      </div>
    </div>
  );
};

export default ReportCard;