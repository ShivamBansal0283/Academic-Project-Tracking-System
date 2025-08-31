// LoginPage.js
import { BrowserRouter as Router } from 'react-router-dom';
import React from 'react';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  const handleLogin = (formData) => {
    // Here you can handle the login logic and redirection based on role
    console.log('Login Data:', formData);
  };

  return (
   
    <div className="login-page">
      <h2>Login</h2>
      <LoginForm onLogin={handleLogin} />
    </div>
    
  );
};

export default LoginPage;
