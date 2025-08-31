// LoginForm.js
import { BrowserRouter as Router } from 'react-router-dom';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/LoginForm.css';

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const history = useNavigate(); 

  const handleLogin = async (e) => {
    try {
        e.preventDefault(); 
      const response = await axios.post('http://localhost:8080/users', {
        username,
        password,
      });
      console.log(response.data);

      if (response.data.success) {
        const role = response.data.role;
        switch (role) {
          case 'student':
            history(`/student/${encodeURIComponent(username)}`);
            break;
          case 'professor':
            history(`/professor/${encodeURIComponent(username)}`);
            break;
          case 'admin':
            history(`/admin/${encodeURIComponent(username)}`);
            break;
          default:
            window.alert('Invalid role');
            break;
        }
      } else {
        window.alert('Invalid credentials');
      } 
    }catch (error) {
      console.error('Error logging in:', error.response.data.error);
      // Handle login error
    }
  };
  return (
    
    <form >
      <div className="form-group">
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit" onClick={handleLogin} >Login</button>
    </form>
    
  );
};

export default LoginForm;
