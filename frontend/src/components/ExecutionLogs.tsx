import React from 'react';

interface Log {
  // Define the structure of a single log entry
  // Example:
  timestamp: string;
  message: string;
  level: 'info' | 'error' | 'warning';
}

interface ExecutionLogsProps {
  logs: Log[];
  title?: string;
}

const ExecutionLogs: React.FC<ExecutionLogsProps> = ({ logs, title = "Execution Logs" }) => {
  return (
    <div className="bg-slate-900 text-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-slate-200">{title}</h3>
      <div className="bg-black rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <div key={index} className={`text-${log.level === 'error' ? 'rose' : 'teal'}-400`}>
              <span className="mr-2 text-slate-500">{log.timestamp}</span>
              <span className="text-slate-300">{log.message}</span>
            </div>
          ))
        ) : (
          <p className="text-slate-400">No logs to display.</p>
        )}
      </div>
    </div>
  );
};

export default ExecutionLogs;