import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

interface AuthProps {
  onLogin: (token: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div>
      {showLogin ? (
        <Login onLogin={onLogin} />
      ) : (
        <Register onRegister={() => setShowLogin(true)} />
      )}
      <button onClick={() => setShowLogin(!showLogin)}>
        {showLogin ? 'Need to register?' : 'Already have an account?'}
      </button>
    </div>
  );
};

export default Auth;