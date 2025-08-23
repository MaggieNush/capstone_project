import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import ClientForm from './ClientForm'; 
import Button from '../common/Button';

const EditClientPage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const userRole = useAuthStore((state) => state.user?.role);

  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Effect to fetch existing client data
  useEffect(() => {
    const fetchClient = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!token || !clientId) {
          throw new Error('Authentication token or Client ID missing.');
        }

        const response = await fetch(`http://localhost:8000/api/v1/clients/${clientId}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Client not found.');
          }
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch client details for editing.');
        }

        const data = await response.json();
        setClientData(data);
      } catch (err) {
        console.error('EditClientPage: Error fetching client:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId, token]);

  // Handle form submission (PUT/PATCH request to update client)
  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setFormErrors({});
    setError(null);

    // Only allow salespersons to update specific fields (e.g., contact info, not status or salesperson)
    const method = 'PATCH'; 

    try {
      const response = await fetch(`http://localhost:8000/api/v1/clients/${clientId}/`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setFormErrors(errorData); // DRF often returns field-specific errors
        throw new Error(errorData.detail || 'Failed to update client.');
      }

      const updatedClient = await response.json();
      console.log('Client updated successfully:', updatedClient);
      navigate(`/clients/${clientId}`, { replace: true }); // Navigate to detail page
    } catch (err) {
      console.error('EditClientPage: Error updating client:', err);
      // If error is just a string, set it as a general error
      if (typeof err.message === 'string') {
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/clients/${clientId}`); // Go back to client detail page
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-600 text-lg">Loading client data for editing...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 text-lg p-4 bg-red-100 rounded-md">
        Error: {error}
        <Button onClick={handleCancel} className="ml-4 bg-blue-500 hover:bg-blue-700">
          Back to Client
        </Button>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="text-center text-gray-600 text-lg p-4">
        No client data loaded for editing.
        <Button onClick={() => navigate('/clients')} className="ml-4 bg-blue-500 hover:bg-blue-700">
          Back to Clients
        </Button>
      </div>
    );
  }

  return (
    <ClientForm
      initialData={clientData}
      onSubmit={handleSubmit}
      isSubmitting={submitting}
      errors={formErrors}
      onCancel={handleCancel}
      title={`Edit Client: ${clientData.name}`}
    />
  );
};

export default EditClientPage;