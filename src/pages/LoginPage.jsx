import React, { useState } from 'react';
import apiClient from '../services/apiClient'; // ✅ Using apiClient instead of axios
import './LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await apiClient.post('/api/auth/login', formData); // ✅ Using apiClient

      if (res.data.redirect === '/register') {
        window.location.href = '/register';
      } else {
      // After login or register:
        localStorage.setItem('token', res.data.token);
         navigate('/timetable-input');
      }
    } catch (error) {
      alert('Login failed. Please check your credentials.');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-area">
        <h1 className="login-title">Admin Login</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            className="login-input"
            placeholder="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="username"
          />
          <input
            className="login-input"
            placeholder="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;