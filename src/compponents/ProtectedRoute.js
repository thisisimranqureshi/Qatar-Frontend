import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const email = localStorage.getItem("userEmail");
  const role = localStorage.getItem("userRole");

  if (!email || !role) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
