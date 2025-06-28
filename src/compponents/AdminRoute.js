// components/AdminRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const role = localStorage.getItem('userRole');
  return ( role === 'admin') ? children : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;
