import React from 'react';

interface Log {
  message: string;
  type: 'info' | 'success' | 'error';
}

interface ExecutionLogsProps {
  logs: Log[];
}

const ExecutionLogs: React.FC<ExecutionLogsProps> = ({ logs }) => {
  return (
    <div>
      <h2>Execution Logs</h2>
      <ul>
        {logs.map((log, index) => (
          <li key={index} className={`log-${log.type}`}>
            {log.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExecutionLogs;