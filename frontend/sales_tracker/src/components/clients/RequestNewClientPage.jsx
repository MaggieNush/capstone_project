import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select'; 

const RequestNewClientPage = () => {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const isSalesperson = useAuthStore((state) => state.isSalesperson());

  const [clientName, setClientName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [clientType, setClientType] = useState('retail'); // Default to retail

  const [loading, setLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formErrors, setFormErrors] = useState({}); 

  const clientTypeOptions = [
    { value: 'retail', label: 'Retail' },
    { value: 'wholesale', label: 'Wholesale' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmissionError(null);
    setSuccessMessage(null);
    setFormErrors({});

    if (!isSalesperson) {
      setSubmissionError('Only salespersons can request new clients.');
      setLoading(false);
      return;
    }
    if (!token) {
      setSubmissionError('Authentication token not found. Please log in again.');
      setLoading(false);
      return;
    }

    const clientPayload = {
      name: clientName,
      contact_person: contactPerson,
      phone_number: phoneNumber,
      email: email,
      address: address,
      client_type: clientType,
      // is_new_client and status will be set by the backend serializer for salespersons
    };

    try {
      const response = await fetch('http://localhost:8000/api/v1/clients/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(clientPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('RequestNewClientPage: Backend Error Data:', errorData);
        setFormErrors(errorData); // DRF often returns field-specific errors
        throw new Error(errorData.detail || errorData.non_field_errors?.[0] || 'Failed to submit client request.');
      }

      const newClient = await response.json();
      console.log('Client request submitted successfully:', newClient);
      setSuccessMessage(`Client '${newClient.name}' requested successfully. Status: ${newClient.status.replace('_', ' ')}. Admin will review.`);
      // Clear form after successful submission
      setClientName('');
      setContactPerson('');
      setPhoneNumber('');
      setEmail('');
      setAddress('');
      setClientType('retail');

    } catch (err) {
      console.error('RequestNewClientPage: Error submitting client request:', err);
      if (typeof err.message === 'string') {
        setSubmissionError(err.message);
      } else {
        setSubmissionError('An unexpected error occurred while submitting client request.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isSalesperson) {
    return (
      <div className="flex justify-center items-center h-full text-red-600 text-lg p-4 bg-red-100 rounded-md">
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Request New Client</h2>

      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
          <p className="font-bold">Success!</p>
          <p>{successMessage}</p>
        </div>
      )}

      {submissionError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{submissionError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Client Name"
          id="clientName"
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="e.g., Grand Market"
          required
          error={formErrors.name}
        />
        <Input
          label="Contact Person"
          id="contactPerson"
          type="text"
          value={contactPerson}
          onChange={(e) => setContactPerson(e.target.value)}
          placeholder="e.g., Jane Doe"
          error={formErrors.contact_person}
        />
        <Input
          label="Phone Number"
          id="phoneNumber"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="e.g., +254712345678"
          error={formErrors.phone_number}
        />
        <Input
          label="Email"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g., jane@example.com"
          error={formErrors.email}
        />
        <div>
          <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">
            Address
          </label>
          <textarea
            id="address"
            rows="3"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
            placeholder="123 Main Street, City"
          ></textarea>
          {formErrors.address && <p className="text-red-500 text-xs italic mt-1">{formErrors.address}</p>}
        </div>
        <Select
          label="Client Type"
          id="clientType"
          value={clientType}
          onChange={(e) => setClientType(e.target.value)}
          options={clientTypeOptions}
          required
          error={formErrors.client_type}
        />

        <div className="flex justify-end space-x-4 mt-6">
          <Button type="button" onClick={() => navigate('/salesperson-dashboard')} className="bg-gray-500 hover:bg-gray-600" disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RequestNewClientPage;