import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Button from '../common/Button';
import Input from '../common/Input'; 
const RecordNewSalePage = () => {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const currentUserId = useAuthStore((state) => state.user?.id); // Get current user's ID
  const isAdmin = useAuthStore((state) => state.isAdmin());

  const [clients, setClients] = useState([]);
  const [flavors, setFlavors] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [saleItems, setSaleItems] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingFlavors, setLoadingFlavors] = useState(true);
  const [fetchingError, setFetchingError] = useState(null); 
  const [submittingSale, setSubmittingSale] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [formErrors, setFormErrors] = useState({}); // For API validation errors

  // --- Fetch Clients ---
  useEffect(() => {
    const fetchClients = async () => {
      setLoadingClients(true);
      setFetchingError(null);
      try {
        if (!token) throw new Error('Authentication token not found.');

        // Salespersons should only see their approved clients for recording sales
        // Admins can see all approved clients.
        let clientUrl = `http://localhost:8000/api/v1/clients/?status=approved`;

        const response = await fetch(clientUrl, {
          headers: { 'Authorization': `Token ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('RecordNewSalePage: Backend Error Data (Clients Fetch):', errorData); // Enhanced error logging
          throw new Error(errorData.detail || 'Failed to fetch clients.');
        }
        const data = await response.json();
        setClients(data.results || data);
      } catch (err) {
        console.error('RecordNewSalePage: Error fetching clients:', err);
        setFetchingError(err.message);
      } finally {
        setLoadingClients(false);
      }
    };
    fetchClients();
  }, [token, currentUserId, isAdmin]); 

  // --- Fetch Flavors ---
  useEffect(() => {
    const fetchFlavors = async () => {
      setLoadingFlavors(true);
      setFetchingError(null); // Re-use fetchingError for flavors
      try {
        if (!token) throw new Error('Authentication token not found.');

        const response = await fetch('http://localhost:8000/api/v1/flavors/', { 
          headers: { 'Authorization': `Token ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('RecordNewSalePage: Backend Error Data (Flavors Fetch):', errorData); // Enhanced error logging
          throw new Error(errorData.detail || 'Failed to fetch flavors.');
        }
        const data = await response.json();
        setFlavors(data.results || data);
      } catch (err) {
        console.error('RecordNewSalePage: Error fetching flavors:', err);
        setFetchingError(err.message);
      } finally {
        setLoadingFlavors(false);
      }
    };
    fetchFlavors();
  }, [token]);

  // --- Sale Item Management Handlers ---
  const handleAddFlavor = (flavorId) => {
    if (!flavorId || saleItems.some(item => item.flavor_id === flavorId)) return; // Prevent duplicates or empty selection

    setSaleItems(prevItems => [
      ...prevItems,
      { flavor_id: flavorId, quantity: 1, flavor_name: flavors.find(f => f.id === flavorId)?.name || 'Unknown' } // Store name for display
    ]);
  };

  const handleQuantityChange = (flavorId, newQuantity) => {
    const quantity = parseInt(newQuantity, 10);
    if (isNaN(quantity) || quantity <= 0) return; // Only allow positive numbers

    setSaleItems(prevItems =>
      prevItems.map(item =>
        item.flavor_id === flavorId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFlavor = (flavorId) => {
    setSaleItems(prevItems => prevItems.filter(item => item.flavor_id !== flavorId));
  };

  // --- Sale Submission Handler ---
  const handleSubmitSale = async (e) => {
    e.preventDefault();
    setSubmittingSale(true);
    setSubmissionError(null);
    setFormErrors({});

    if (!selectedClient) {
      setSubmissionError('Please select a client.');
      setSubmittingSale(false);
      return;
    }
    if (saleItems.length === 0) {
      setSubmissionError('Please add at least one flavor item to the sale.');
      setSubmittingSale(false);
      return;
    }
    if (saleItems.some(item => item.quantity <= 0)) {
        setSubmissionError('All selected items must have a quantity greater than zero.');
        setSubmittingSale(false);
        return;
    }

    const salePayload = {
      client_id: selectedClient, 
      order_items: saleItems.map(item => ({ 
        flavor_id: item.flavor_id, 
        quantity_liters: item.quantity, 
      })),
    };

    console.log('RecordNewSalePage: Submitting payload:', salePayload); 

    try {
      const response = await fetch('http://localhost:8000/api/v1/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(salePayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('RecordNewSalePage: Backend Error Data (Sale Submission):', errorData); 
        setFormErrors(errorData); 
        throw new Error(errorData.detail || errorData.non_field_errors?.[0] || 'Failed to record sale.');
      }

      const newSale = await response.json();
      console.log('Sale recorded successfully:', newSale);
      navigate('/sales-reports', { replace: true }); // Redirect to sales reports or dashboard
    } catch (err) {
      console.error('RecordNewSalePage: Error recording sale:', err);
      if (typeof err.message === 'string') {
        setSubmissionError(err.message);
      } else {
        setSubmissionError('An unexpected error occurred while recording sale.');
      }
    } finally {
      setSubmittingSale(false);
    }
  };

  // --- Conditional Rendering ---
  if (loadingClients || loadingFlavors) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-600 text-lg">Loading data for new sale...</p>
      </div>
    );
  }

  if (fetchingError) {
    return (
      <div className="text-center text-red-600 text-lg p-4 bg-red-100 rounded-md">
        Error: {fetchingError}
        <Button onClick={() => window.location.reload()} className="ml-4 bg-red-500 hover:bg-red-700">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Record New Sale</h2>

      {submissionError && (
        <div className="text-red-600 text-sm mb-4 p-3 bg-red-100 rounded-md">
          {submissionError}
        </div>
      )}

      <form onSubmit={handleSubmitSale} className="space-y-6">
        {/* Client Selection */}
        <div>
          <label htmlFor="clientSelect" className="block text-gray-700 text-sm font-bold mb-2">
            Select Client <span className="text-red-500">*</span>
          </label>
          <select
            id="clientSelect"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
            required
          >
            <option value="">-- Choose a Client --</option>
            {clients.length === 0 ? (
              <option disabled>No approved clients available.</option>
            ) : (
              clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.contact_person || 'N/A'})
                </option>
              ))
            )}
          </select>
          {formErrors.client && <p className="text-red-500 text-xs italic mt-1">{formErrors.client}</p>}
        </div>

        {/* Flavor Selection and Quantity Input */}
        <div>
          <label htmlFor="flavorSelect" className="block text-gray-700 text-sm font-bold mb-2">
            Add Flavors <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-2 mb-4">
            <select
              id="flavorSelect"
              onChange={(e) => handleAddFlavor(parseInt(e.target.value, 10))} // Ensure ID is integer
              value="" // Reset select value after adding
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
            >
              <option value="">-- Add a Flavor --</option>
              {flavors.length === 0 ? (
                <option disabled>No flavors available.</option>
              ) : (
                flavors.filter(
                  (flavor) => !saleItems.some(item => item.flavor_id === flavor.id)
                ).map((flavor) => (
                  <option key={flavor.id} value={flavor.id}>
                    {flavor.name} (${parseFloat(flavor.base_price_per_liter || '0').toFixed(2)}) {/* Use base_price_per_liter */}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Display Selected Sale Items */}
          {saleItems.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Selected Items:</h3>
              <ul className="space-y-3">
                {saleItems.map((item) => (
                  <li key={item.flavor_id} className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm">
                    <span className="font-medium text-gray-700 flex-grow">{item.flavor_name}</span>
                    <div className="flex items-center space-x-2">
                      <label htmlFor={`qty-${item.flavor_id}`} className="sr-only">Quantity for {item.flavor_name}</label>
                      <Input
                        id={`qty-${item.flavor_id}`}
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.flavor_id, e.target.value)}
                        className="w-20 text-center py-1 px-2 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                      />
                      <Button
                        type="button"
                        onClick={() => handleRemoveFlavor(item.flavor_id)}
                        className="bg-red-500 hover:bg-red-600 py-1 px-3 text-sm"
                      >
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
              {formErrors.order_items && <p className="text-red-500 text-xs italic mt-2">{formErrors.order_items}</p>}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Button type="button" onClick={() => navigate('/salesperson-dashboard')} className="bg-gray-500 hover:bg-gray-600" disabled={submittingSale}>
            Cancel
          </Button>
          <Button type="submit" disabled={submittingSale} className="bg-blue-600 hover:bg-blue-700">
            {submittingSale ? 'Recording...' : 'Record Sale'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RecordNewSalePage;