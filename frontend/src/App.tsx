import React, { useState } from 'react';
import './App.css';
import ApiTester from './components/ApiTester';
import Auth from './components/auth/Auth';
import TestSuitesPage from './components/TestSuitesPage';

function App(): React.ReactElement {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('tester');

  const handleLogin = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <div className="App">
      {token ? (
        <>
          <nav className="app-nav">
            <button onClick={() => setActiveTab('tester')} className={activeTab === 'tester' ? 'active' : ''}>
              API Tester
            </button>
            <button onClick={() => setActiveTab('suites')} className={activeTab === 'suites' ? 'active' : ''}>
              Test Suites
            </button>
            <button onClick={handleLogout}>Logout</button>
          </nav>
          <main>
            {activeTab === 'tester' && <ApiTester />}
            {activeTab === 'suites' && <TestSuitesPage />}
          </main>
        </>
      ) : (
        <Auth onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;