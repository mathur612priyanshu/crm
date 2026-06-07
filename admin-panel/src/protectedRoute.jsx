import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles = ["manager", "operations"] }) {
  const isLogin = localStorage.getItem("isLogin");
  const employeeRole = localStorage.getItem("employeeRole");

  if (!isLogin) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(employeeRole)) {
    if (employeeRole === "operations") {
      return <Navigate to="/operations" replace />;
    }
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
