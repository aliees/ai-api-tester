import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import './Auth.css';

interface AuthProps {
  onLogin: (token: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="auth-container">
      <div className="auth-card">
        {showLogin ? (
          <Login onLogin={onLogin} />
        ) : (
          <Register onRegister={() => setShowLogin(true)} />
        )}
        <button className="auth-toggle-button" onClick={() => setShowLogin(!showLogin)}>
          {showLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
};

export default Auth;