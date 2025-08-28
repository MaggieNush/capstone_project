import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const ProtectedRoute = ({ allowedRoles }) => {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const userRole = useAuthStore((state) => state.user?.role); // Safely get the user's role

    // If not logged in, redirect to login page
  if (!isLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  // If logged in redirect to respective dashboards
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === 'admin') {
        return <Navigate to="/admin-dashboard" replace />;
    } else if (userRole === 'salesperson') {
        return <Navigate to="/salesperson-dashboard" replace />;
    }
    // Fallback if role is not recognized or no specific redirect
    return <Navigate to="/" replace />; 
  }

  // If logged in and role is allowed, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;