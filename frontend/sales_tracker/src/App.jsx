// src/App.jsx
import React, { useEffect } from 'react';
import { Router, Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './components/Auth/LoginPage'; 
import SalespersonDashboard from './components/dashboard/SalespersonDashboard'; // Import SalespersonDashboard
import AdminDashboard from './components/dashboard/AdminDashboard'; // Import AdminDashboard
import ProtectedRoute from './components/Auth/ProtectedRoute'; // Import ProtectedRoute for route protection
import useAuthStore from './store/authStore'; // Import auth store for authentication state
import './index.css'; 

function App() {
  // Selecting the necessary state and getters from the store
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const isAdmin = useAuthStore((state) => state.isAdmin());
  const isSalesperson = useAuthStore((state) => state.isSalesperson());
  const navigate = useNavigate(); // For root redirection

  useEffect(() => {
    // Redirect logic on initial load
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin-dashboard', { replace: true });
      } else if (isSalesperson) {
        navigate('/salesperson-dashboard', { replace: true });
      }
    } else {
      // If not authenticated, redirect to login page
      if (window.location.pathname !== '/') {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, isSalesperson, navigate]); // Dependency array for useEffect

  return (
      <div className='min-h-screen bg-gray-100 flex items-center justify-center'>
        <Routes>
        {/* Public route */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute allowedRoles={['salesperson']} />}>
          <Route path='/salesperson-dashboard' element={<SalespersonDashboard />}/>
          {/* Add more Salesperson specific routes here */}
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path='/admin-dashboard' element={<AdminDashboard />}/>
          {/* Add more Admin specific routes here */}
        </Route>
        {/* Catch-all route for undefined paths */}
        <Route path='*' element={<h1 className='text-xl text-red-500'>404 - Page Not Found</h1>} />
      </Routes>
    </div>
  );
};
export default App;