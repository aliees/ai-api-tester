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
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onDownload }) => {
  return (
    <div>
      <h2>Test Report</h2>
      <p>Total Tests: {report.totalTests}</p>
      <p>Passed: {report.passed}</p>
      <p>Failed: {report.failed}</p>
      <p>Average Response Time: {report.averageResponseTime}ms</p>
      <button onClick={onDownload}>Download Report</button>
    </div>
  );
};

export default ReportCard;