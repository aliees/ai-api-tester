import React, { useState } from 'react';
import './App.css';
import ApiTester from './components/ApiTester';
import Auth from './components/auth/Auth';

function App(): React.ReactElement {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

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
          <button onClick={handleLogout}>Logout</button>
          <ApiTester />
        </>
      ) : (
        <Auth onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;