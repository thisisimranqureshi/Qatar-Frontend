// components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('userRole');

  return userEmail && userRole ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
