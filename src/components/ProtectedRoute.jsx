// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  // Optional: Validate token on mount
  React.useEffect(() => {
    const verifyToken = async () => {
      try {
        await apiClient.get('/api/auth/verify');
      } catch (error) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    };
    verifyToken();
  }, []);

  return children;
};

export default ProtectedRoute;