import { useState, useEffect, use } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';


const ClientForm = ({ initialData = {}, onsubmit, isSubmitting, errors = {}, onCancel, title}) => {
    const [formData, setFormData] = useState({
        name: '',
        client_type: 'retail',
        contact_person: '',
        phone_number: '',
        email: '',
        address: ''
    });

    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormData({
                name: initialData.name || '',
                client_type: initialData.client_type || 'retail',
                contact_person: initialData.contact_person || '',
                phone_number: initialData.phone_number || '',
                email: initialData.email || '',
                address: initialData.address || ''
            })
        } else {
      // Reset form if no initialData is provided (for new client creation)
      setFormData({
        name: '',
        client_type: 'retail',
        contact_person: '',
        phone_number: '',
        email: '',
        address: '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onsubmit(formData);
  };

  return (
    <div className='bg-white p-6 rounded-lg shadow-md w-full max-w-2xl mx-auto'>
        <h2 className='text-3xl font-bold text-gray-800 mb-6 text-center'>{title || 'Client Form'}</h2>

        <form onSubmit={handleSubmit}>
            <Input
                label="Client Name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Kimathi Supermarket"
                required
                error={errors.name}
            />
                <div className="mb-4">
          <label htmlFor="client_type" className="block text-gray-700 text-sm font-bold mb-2">
            Client Type
          </label>
          <select
            id="client_type"
            value={formData.client_type}
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
          value={formData.contact_person}
          onChange={handleChange}
          placeholder="e.g., John Doe"
          error={errors.contact_person}
        />
        <Input
          label="Phone Number"
          id="phone_number"
          type="tel"
          value={formData.phone_number}
          onChange={handleChange}
          placeholder="e.g., +254712345678"
          error={errors.phone_number}
        />
        <Input
          label="Email"
          id="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="e.g., info@abc.com"
          error={errors.email}
        />
        <Input
          label="Address"
          id="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="e.g., 123 Main St, City"
          error={errors.address}
        />

        {errors.non_field_errors && (
            <p className="text-red-500 text-sm mb-4">{errors.non_field_errors}</p>
        )}

        <div className="flex justify-end space-x-4 mt-6">
          {onCancel && (
            <Button type="button" onClick={onCancel} className="bg-gray-500 hover:bg-gray-600" disabled={isSubmitting}>
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
}

export default ClientForm;