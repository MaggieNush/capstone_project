import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom'; 
import Button from '../common/Button';
import useAuthStore from '../../store/authStore';

const ClientDetailPage = () => {
    const {clientId} = useParams(); // Get client id from url
    const navigate = useNavigate();
    const token = useAuthStore((state) => state.token);
    const userRole = useAuthStore((state) => state.user?.role); // Get user role from auth store

    const [client, setClient] = useState(null)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);   

    useEffect(() => {
        const fetchClientDetails = async () => {
            setLoading(true);
            setError(null);

            try {
                if (!token) {
                    throw new Error('No authentication token found');
                }
                if (!clientId) {
                    throw new Error('No client ID provided in URL');
                }

                console.log (`ClientDetailPage: Fetching details for client ID ${clientId}`);
                const response =await fetch(`http://localhost:8000/api/v1/clients/${clientId}/`, {
                    method: 'GET',
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': `Token ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Failed to fetch client details');
                }
                const data = await response.json();
        console.log('ClientDetailPage: Fetched client data:', data);
        setClient(data);
      } catch (err) {
        console.error('ClientDetailPage: Error fetching client details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchClientDetails();
  }, [clientId, token]); // Re-fetch if clientId or token changes

  const handleEditClick = () => {
    navigate(`/clients/${clientId}/edit`); // Navigate to the edit page
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-600 text-lg">Loading client details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 text-lg p-4 bg-red-100 rounded-md">
        Error: {error}
        <Button onClick={() => navigate('/clients')} className="ml-4 bg-blue-500 hover:bg-blue-700">
          Back to Clients
        </Button>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center text-gray-600 text-lg p-4">
        No client data available.
        <Button onClick={() => navigate('/clients')} className="ml-4 bg-blue-500 hover:bg-blue-700">
          Back to Clients
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Client Details: {client.name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-gray-600 font-semibold">Client Name:</p>
          <p className="text-gray-800 text-lg">{client.name}</p>
        </div>
        <div>
          <p className="text-gray-600 font-semibold">Client Type:</p>
          <p className="text-gray-800 text-lg capitalize">{client.client_type}</p>
        </div>
        <div>
          <p className="text-gray-600 font-semibold">Contact Person:</p>
          <p className="text-gray-800 text-lg">{client.contact_person || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-600 font-semibold">Phone Number:</p>
          <p className="text-gray-800 text-lg">{client.phone_number || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-600 font-semibold">Email:</p>
          <p className="text-gray-800 text-lg">{client.email || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-600 font-semibold">Address:</p>
          <p className="text-gray-800 text-lg">{client.address || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-600 font-semibold">Status:</p>
          <p className={`text-lg capitalize ${
              client.status === 'approved' ? 'text-green-600' :
              client.status === 'pending_approval' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
            {client.status.replace('_', ' ')}
          </p>
        </div>
        <div>
          <p className="text-gray-600 font-semibold">Assigned Salesperson:</p>
          <p className="text-gray-800 text-lg">{client.assigned_salesperson?.user?.username || 'None'}</p>
        </div>
        <div>
          <p className="text-gray-600 font-semibold">Is New Client:</p>
          <p className="text-gray-800 text-lg">{client.is_new_client ? 'Yes' : 'No'}</p>
        </div>
        <div>
          <p className="text-gray-600 font-semibold">Outstanding Balance:</p>
          <p className="text-lg font-bold text-red-700">
            ${parseFloat(client.outstanding_balance || '0').toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <Button onClick={() => navigate('/clients')} className="bg-gray-500 hover:bg-gray-600">
          Back to List
        </Button>
        <Button onClick={() => navigate(`/clients/${clientId}/edit`)} className="bg-yellow-500 hover:bg-yellow-600">
          Edit Client
        </Button> 
      </div>
    </div>
  );
};

export default ClientDetailPage;