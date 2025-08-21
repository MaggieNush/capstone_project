import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './components/Auth/LoginPage'; 
import SalespersonDashboard from './components/dashboard/SalespersonDashboard'; // Import SalespersonDashboard
import AdminDashboard from './components/dashboard/AdminDashboard'; // Import AdminDashboard
import ProtectedRoute from './components/Auth/ProtectedRoute'; // Import ProtectedRoute for route protection
import Layout from './components/layout/Layout'; // Import Layout for consistent structure
import ClientListPage from './components/clients/ClientListPage'; // Import ClientListPage
import useAuthStore from './store/authStore'; // Import auth store for authentication state
import './index.css'; 

function App() {
  // Selecting the necessary state and getters from the store
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const isAdmin = useAuthStore((state) => state.isAdmin());
  const isSalesperson = useAuthStore((state) => state.isSalesperson());
  const navigate = useNavigate(); // For root redirection

  return (
      <div className='flex flex-col min-h-screen'>
        <Routes>
        {/* Public route */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected routes */}
          <Route element={<ProtectedRoute allowedRoles={['salesperson', 'admin']} />}>
          <Route element={<Layout />}> {/* Nested Layout under ProtectedRoute */}
            <Route path="/salesperson-dashboard" element={<SalespersonDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            {/* Salesperson specific routes */}
            <Route path="/clients" element={<ClientListPage />} /> {/* ClientListPage for viewing clients */}
            <Route path="/new-sale" element={<h2 className="text-2xl font-bold">Record New Sale Page (Coming Soon)</h2>} />
            <Route path="/new-client-request" element={<h2 className="text-2xl font-bold">New Client Request Page (Coming Soon)</h2>} />
            <Route path="/sales-reports" element={<h2 className="text-2xl font-bold">Sales Reports Page (Coming Soon)</h2>} />

            {/* Admin specific routes */}
            <Route path="/manage-salespersons" element={<h2 className="text-2xl font-bold">Manage Salespersons Page (Coming Soon)</h2>} />
            <Route path="/pending-clients" element={<h2 className="text-2xl font-bold">Pending Clients Page (Coming Soon)</h2>} />
            <Route path="/manage-flavors" element={<h2 className="text-2xl font-bold">Manage Flavors Page (Coming Soon)</h2>} />
            <Route path="/overall-reports" element={<h2 className="text-2xl font-bold">Overall Reports Page (Coming Soon)</h2>} />
          </Route>
        </Route>
        {/* Catch-all route for undefined paths */}
        <Route path='*' element={<h1 className='text-xl text-red-500'>404 - Page Not Found</h1>} />
      </Routes>
    </div>
  );
};
export default App;