import React from "react";
import { Navigate } from "react-router-dom";

const ManagerRoute = ({ children }) => {
  const role = localStorage.getItem("userRole");

  if (role !== "manager") {
    // Redirect unauthorized users
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ManagerRoute;
