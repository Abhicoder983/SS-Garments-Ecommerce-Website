// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('admin_access_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}