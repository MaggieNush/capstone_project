import React, { useEffect } from "react";
import { useState } from "react";
import useAuthStore from "../../store/authStore"; // For authentication token
import Input from "../common/Input";
import Button from "../common/Button";
import { useNavigate } from "react-router-dom";

const ClientListPage = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState(""); // Client type whether wholesale or retail
    const token = useAuthStore((state) => state.token); // Get the authentication token
    const userRole = useAuthStore((state) => state.user?.role); // Get user role
    const navigate = useNavigate(); // For navigation

    useEffect(() => {
        const fetchClients = async () => {
            setLoading(true);
            setError(null);

            try {
                let url = 'http://localhost:8000/api/v1/clients?';

                if (searchTerm) {
                    url += `search=${searchTerm}&`;
                }
                if (filterType) {
                    url += `client_type=${filterType}&`;
                }

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}`, // Includes the authentication
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Failed to fetch clients');
                }

                const data = await response.json();
                setClients(data);
            } catch (err) {
                console.error('Error fetching clients:', err);
                setError(err.message);
            } finally {
                setLoading(false);
        }
    };

    if (token) { // Only fetch if authenticated (token exists)
      fetchClients();
    }
  }, [token, searchTerm, filterType]); // Re-fetch when token, search term, or filter type changes

  const handleClientClick = (clientId) => {
    // Navigate to a client detail page (placeholder for now)
    navigate(`/clients/${clientId}`);
  };

  const handleCreateNewClient = () => {
    navigate('/clients/new'); // Navigate to the new client creation page
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-600 text-lg">Loading clients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 text-lg p-4 bg-red-100 rounded-md">
        Error: {error}
        <Button onClick={() => window.location.reload()} className="ml-4 bg-red-500 hover:bg-red-700">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <div className="flex justify-between items-center mb-6"> {/* New flex container */}
        <h2 className="text-3xl font-bold text-gray-800">My Clients</h2>
        {/* Render "Create New Client" button for salespersons and admins */}
        {(userRole === 'salesperson' || userRole === 'admin') && (
          <Button onClick={handleCreateNewClient} className="bg-green-600 hover:bg-green-700">
            Create New Client
          </Button>
        )}
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
        <Input
          id="search"
          placeholder="Search by client name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <select
          id="filterType"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
        >
          <option value="">All Types</option>
          <option value="wholesale">Wholesale</option>
          <option value="retail">Retail</option>
        </select>
      </div>

      {clients.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No clients found or assigned to you.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client Name</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Outstanding Balance</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                  <td className="py-3 px-4 text-sm text-gray-800">{client.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-800 capitalize">{client.client_type}</td>
                  <td className="py-3 px-4 text-sm text-gray-800 capitalize">{client.status.replace('_', ' ')}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">${parseFloat(client.outstanding_balance || '0').toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm">
                    <button
                      onClick={() => handleClientClick(client.id)}
                      className="text-blue-600 hover:text-blue-800 font-semibold transition duration-150 ease-in-out"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientListPage;