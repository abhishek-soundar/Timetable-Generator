// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import './RegisterPage.css';


const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate(); // ✅ Use navigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.department.trim())
      newErrors.department = 'Department is required';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsRegistering(true);

    try {
      const res = await apiClient.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department
      });

      // ✅ Save token as 'token' (not 'adminToken')
      // After login or register:
      localStorage.setItem('token', res.data.token);

      // ✅ Redirect using React Router
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error.response?.data || error.message);
      alert('Registration failed. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="register-container">
      <div className="welcome-text">Welcome Admin</div>

      <form onSubmit={handleSubmit} className="register-form">
        <input
          className="input-field"
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          autoComplete="off"
        />
        {errors.name && <p className="error-message">{errors.name}</p>}

        <input
          className="input-field"
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="off"
        />
        {errors.email && <p className="error-message">{errors.email}</p>}

        <input
          className="input-field"
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="new-password"
        />
        {errors.password && <p className="error-message">{errors.password}</p>}

        <input
          className="input-field"
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
        />
        {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}

        <input
          className="input-field"
          type="text"
          name="department"
          placeholder="Department"
          value={formData.department}
          onChange={handleChange}
          autoComplete="off"
        />
        {errors.department && <p className="error-message">{errors.department}</p>}

        <button type="submit" className="register-button" disabled={isRegistering}>
          {isRegistering ? 'Registering...' : 'REGISTER'}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;