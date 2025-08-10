// src/routes/index.js
import { createBrowserRouter, Navigate } from 'react-router-dom';
import React from 'react';
import RegisterPage from '../pages/RegisterPage';
import LoginPage from '../pages/LoginPage';
import TimetableInputPage from '../pages/TimetableInputPage';
import TimetableViewPage from '../pages/TimetableViewPage';
import apiClient from '../services/apiClient';

// ✅ Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/register" />;
  }

  // Optional: Validate token
  React.useEffect(() => {
    const verify = async () => {
      try {
        await apiClient.get('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch {
        localStorage.removeItem('token');
        window.location.href = '/register';
      }
    };
    verify();
  }, []);

  return children;
};

// ✅ Public Route (Redirect if already logged in)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Optionally verify token and redirect
    return <Navigate to="/timetable-input" />;
  }
  return children;
};

const router = createBrowserRouter([
  {
    path: '/register',
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/timetable-input',
    element: (
      <ProtectedRoute>
        <TimetableInputPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/timetable-view',
    element: (
      <ProtectedRoute>
        <TimetableViewPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: <Navigate to="/register" />, // ✅ Always start at register
  },
]);

export default router;