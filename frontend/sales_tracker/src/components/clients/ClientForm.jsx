import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

// initialData will be the existing client object when editing
const ClientForm = ({ initialData = {}, onSubmit, isSubmitting, errors = {}, onCancel, title }) => {
  // Initialize formData directly using a function to derive initial state once
  const [formData, setFormData] = useState(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      // If initialData is provided, populate the form with its values
      return {
        name: initialData.name || '',
        client_type: initialData.client_type || 'retail',
        contact_person: initialData.contact_person || '',
        phone_number: initialData.phone_number || '',
        email: initialData.email || '',
        address: initialData.address || '',
      };
    }
    // Otherwise, return default empty values for new client creation
    return {
      name: '',
      client_type: 'retail',
      contact_person: '',
      phone_number: '',
      email: '',
      address: '',
    };
  });

  // Use useEffect only for subsequent changes to initialData (e.g., in EditClientPage if the client ID changes)
  // For CreateClientPage, initialData is always {}, so this effect won't trigger setFormData repeatedly.
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const newFormData = {
        name: initialData.name || '',
        client_type: initialData.client_type || 'retail',
        contact_person: initialData.contact_person || '',
        phone_number: initialData.phone_number || '',
        email: initialData.email || '',
        address: initialData.address || '',
      };

      // Only update state if the new data is actually different to prevent unnecessary renders
      // A more robust deep comparison could be used, but for simple objects, this often suffices.
      if (JSON.stringify(newFormData) !== JSON.stringify(formData)) {
          setFormData(newFormData);
      }
    }
  }, [initialData, formData]); // Include formData in dependencies to compare against current state

  // Handler for all input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    console.log(`ClientForm: Input changed - ID: ${id}, Value: ${value}`); // Debugging input
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  // Handler for form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default browser form submission
    console.log('ClientForm: Form submitted with data:', formData); // Debugging submission
    onSubmit(formData); // Call the onSubmit prop function
  };

  // Handler for cancel button click
  const handleCancelClick = () => {
    console.log('ClientForm: Cancel button clicked.'); // Debugging cancel
    if (onCancel) {
      onCancel(); // Call the onCancel prop function if provided
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">{title || 'Client Form'}</h2>

      <form onSubmit={handleSubmit}>
        <Input
          label="Client Name"
          id="name"
          value={formData.name} // Ensure value is bound to state
          onChange={handleChange}
          placeholder="e.g., ABC Supermarket"
          required
          error={errors.name}
        />
        <div className="mb-4">
          <label htmlFor="client_type" className="block text-gray-700 text-sm font-bold mb-2">
            Client Type
          </label>
          <select
            id="client_type"
            value={formData.client_type} // Ensure value is bound to state
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
            required
          >
            <option value="retail">Retail</option>
            <option value="wholesale">Wholesale</option>
          </select>
          {errors.client_type && <p className="text-red-500 text-xs italic">{errors.client_type}</p>}
        </div>
        <Input
          label="Contact Person"
          id="contact_person"
          value={formData.contact_person} // Ensure value is bound to state
          onChange={handleChange}
          placeholder="e.g., John Doe"
          error={errors.contact_person}
        />
        <Input
          label="Phone Number"
          id="phone_number"
          type="tel"
          value={formData.phone_number} // Ensure value is bound to state
          onChange={handleChange}
          placeholder="e.g., +254712345678"
          error={errors.phone_number}
        />
        <Input
          label="Email"
          id="email"
          type="email"
          value={formData.email} // Ensure value is bound to state
          onChange={handleChange}
          placeholder="e.g., info@abc.com"
          error={errors.email}
        />
        <Input
          label="Address"
          id="address"
          value={formData.address} // Ensure value is bound to state
          onChange={handleChange}
          placeholder="e.g., 123 Main St, City"
          error={errors.address}
        />

        {errors.non_field_errors && (
            <p className="text-red-500 text-sm mb-4">{errors.non_field_errors}</p>
        )}

        <div className="flex justify-end space-x-4 mt-6">
          {onCancel && ( // Only render cancel button if onCancel prop is provided
            <Button type="button" onClick={handleCancelClick} className="bg-gray-500 hover:bg-gray-600" disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;