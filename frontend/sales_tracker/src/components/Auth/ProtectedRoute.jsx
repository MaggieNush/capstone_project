import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const ProtectedRoute = ({ allowedRoles }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated())
    const userRole = useAuthStore((state) => state.user?.role); // Safely get the user's role

    if (!isAuthenticated) {
        // If not authenticated, redirect to login page

        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // If user is not allowed, redirect to login page
        console.warn(`Access denied for role: ${userRole}`);
        return <Navigate to="/" replace />;
    }

    // If authenticated and authorized, render the child routes
    return <Outlet />;
};

export default ProtectedRoute;
