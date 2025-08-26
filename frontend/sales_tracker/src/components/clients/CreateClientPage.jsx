import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import ClientForm from './ClientForm';

const CreateClientPage = () => {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setFormErrors({});
    setError(null);

    let submissionData = { ...formData };

    try {
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      console.log('CreateClientPage: Submitting new client data:', submissionData);
      const response = await fetch('http://localhost:8000/api/v1/clients/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setFormErrors(errorData);
        throw new Error(errorData.detail || 'Failed to create client.');
      }

      const newClient = await response.json();
      console.log('Client created successfully:', newClient);

      navigate(`/clients/${newClient.id}`, { replace: true });
    } catch (err) {
      console.error('CreateClientPage: Error creating client:', err);
      if (typeof err.message === 'string') {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/clients');
  };

  return (
    <>
      {error && (
        <div className="text-center text-red-600 text-lg p-4 bg-red-100 rounded-md mb-4">
          General Error: {error}
        </div>
      )}
      <ClientForm
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        errors={formErrors}
        onCancel={handleCancel}
        title="Create New Client"
      />
    </>
  );
};

export default CreateClientPage;