import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './components/Auth/LoginPage'; 
import SalespersonDashboard from './components/dashboard/SalespersonDashboard'; 
import AdminDashboard from './components/dashboard/AdminDashboard'; 
import ProtectedRoute from './components/Auth/ProtectedRoute'; 
import Layout from './components/layout/Layout'; 
import ClientListPage from './components/clients/ClientListPage'; 
import ClientDetailPage from './components/clients/ClientDetailPage'; 
import CreateClientPage from './components/clients/CreateClientPage';
import PendingClientsPage from './components/clients/PendingClientsPage';
import RecordNewSalePage from './components/sales/RecordNewSalePage';
import SalesReportsPage from './components/sales/SalesReportsPage';
import RequestNewClientPage from './components/clients/RequestNewClientPage';
import EditClientPage from './components/clients/EditClient';
import useAuthStore from './store/authStore'; 
import './index.css'; 

function App() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn); 

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

            {/* Client management routes */}
            <Route path="/clients" element={<ClientListPage />} /> {/* ClientListPage for viewing clients */}
            <Route path="/clients/new" element={<CreateClientPage />} /> {/* CreateClientPage for adding new clients */}
            <Route path="/clients/:clientId" element={<ClientDetailPage />} /> {/* ClientDetailPage for viewing client details */}
            <Route path="/clients/:clientId/edit" element={<EditClientPage />} /> {/* EditClientPage for editing client details */}
            {/* Sales Routes */}
            <Route path="/new-sale" element={<RecordNewSalePage />} />

            {/* Salesperson specific routes */}
            <Route path="/new-client-request" element={<RequestNewClientPage />} />
            <Route path="/sales-reports" element={<SalesReportsPage />} />

            {/* Admin specific routes */}
            <Route path="/pending-clients" element={<PendingClientsPage />} /> {/* PendingClientsPage for viewing pending clients */}
            <Route path="/manage-salespersons" element={<h2 className="text-2xl font-bold">Manage Salespersons Page (Coming Soon)</h2>} />
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