import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';

const ManageFlavorsPage = () => {
  const token = useAuthStore((state) => state.token);
  const isAdmin = useAuthStore((state) => state.isAdmin());

  const [flavors, setFlavors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for Add Flavor Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFlavorName, setNewFlavorName] = useState('');
  const [newFlavorPrice, setNewFlavorPrice] = useState('');
  const [addFlavorError, setAddFlavorError] = useState(null);
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // State for Edit Flavor Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentFlavor, setCurrentFlavor] = useState(null); // The flavor currently being edited
  const [editFlavorName, setEditFlavorName] = useState('');
  const [editFlavorPrice, setEditFlavorPrice] = useState('');
  const [editFlavorActive, setEditFlavorActive] = useState(true);
  const [editFlavorError, setEditFlavorError] = useState(null);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // --- Fetch Flavors ---
  const fetchFlavors = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!token) throw new Error('Authentication token not found.');
      if (!isAdmin) throw new Error('You do not have permission to view this page.');

      const response = await fetch('http://localhost:8000/api/v1/flavors/', {
        headers: { 'Authorization': `Token ${token}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ManageFlavorsPage: Backend Error Data (Flavors Fetch):', errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.detail || 'Failed to fetch flavors.');
        } catch (jsonError) {
          throw new Error(`Failed to fetch flavors: ${errorText.substring(0, 200)}... (Response was not JSON)`);
        }
      }
      const data = await response.json();
      setFlavors(data.results || data); // Handle both paginated and non-paginated responses
      console.log('ManageFlavorsPage: Fetched flavors data:', data.results || data);
    } catch (err) {
      console.error('ManageFlavorsPage: Error fetching flavors:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && token) {
      fetchFlavors();
    }
  }, [isAdmin, token]); // Re-fetch when admin status or token changes

  // --- Add Flavor Modal Handlers ---
  const openAddModal = () => {
    setIsAddModalOpen(true);
    setNewFlavorName('');
    setNewFlavorPrice('');
    setAddFlavorError(null);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleAddFlavor = async (e) => {
    e.preventDefault();
    setAddFlavorError(null);
    setSubmittingAdd(true);

    try {
      const response = await fetch('http://localhost:8000/api/v1/flavors/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          name: newFlavorName,
          base_price_per_liter: parseFloat(newFlavorPrice),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('ManageFlavorsPage: Backend Error Data (Add Flavor):', errorData);
        if (errorData.name) setAddFlavorError(`Name: ${errorData.name[0]}`);
        else if (errorData.base_price_per_liter) setAddFlavorError(`Price: ${errorData.base_price_per_liter[0]}`);
        else throw new Error(errorData.detail || 'Failed to add flavor.');
      } else {
        console.log('Flavor added successfully!');
        closeAddModal();
        fetchFlavors(); // Refresh the list of flavors
      }
    } catch (err) {
      console.error('ManageFlavorsPage: Error adding flavor:', err);
      setAddFlavorError(err.message);
    } finally {
      setSubmittingAdd(false);
    }
  };

  // --- Edit Flavor Modal Handlers ---
  const openEditModal = (flavor) => {
    setCurrentFlavor(flavor);
    setEditFlavorName(flavor.name);
    setEditFlavorPrice(flavor.base_price_per_liter);
    setEditFlavorActive(flavor.is_active);
    setEditFlavorError(null);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentFlavor(null);
  };

  const handleEditFlavor = async (e) => {
    e.preventDefault();
    setEditFlavorError(null);
    setSubmittingEdit(true);

    try {
      const response = await fetch(`http://localhost:8000/api/v1/flavors/${currentFlavor.id}/`, {
        method: 'PATCH', // Using PATCH for partial update
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          name: editFlavorName,
          base_price_per_liter: parseFloat(editFlavorPrice),
          is_active: editFlavorActive,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('ManageFlavorsPage: Backend Error Data (Edit Flavor):', errorData);
        if (errorData.name) setEditFlavorError(`Name: ${errorData.name[0]}`);
        else if (errorData.base_price_per_liter) setEditFlavorError(`Price: ${errorData.base_price_per_liter[0]}`);
        else throw new Error(errorData.detail || 'Failed to update flavor.');
      } else {
        console.log('Flavor updated successfully!');
        closeEditModal();
        fetchFlavors(); // Refresh the list of flavors
      }
    } catch (err) {
      console.error('ManageFlavorsPage: Error updating flavor:', err);
      setEditFlavorError(err.message);
    } finally {
      setSubmittingEdit(false);
    }
  };

  // --- Deactivate/Activate Flavor ---
  const toggleFlavorActiveStatus = async (flavor) => {
    if (!window.confirm(`Are you sure you want to ${flavor.is_active ? 'deactivate' : 'activate'} "${flavor.name}"?`)) {
      return;
    }
    setSubmittingEdit(true); // Reusing this state to disable buttons
    try {
      const response = await fetch(`http://localhost:8000/api/v1/flavors/${flavor.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({ is_active: !flavor.is_active }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('ManageFlavorsPage: Backend Error Data (Toggle Active Status):', errorData);
        throw new Error(errorData.detail || 'Failed to toggle flavor status.');
      } else {
        console.log(`Flavor "${flavor.name}" status toggled successfully.`);
        fetchFlavors(); // Refresh list
      }
    } catch (err) {
      console.error('ManageFlavorsPage: Error toggling flavor status:', err);
      setError(err.message); // Use main error state for this
    } finally {
      setSubmittingEdit(false);
    }
  };


  // --- Conditional Rendering ---
  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center h-full text-red-600 text-lg p-4 bg-red-100 rounded-md">
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-600 text-lg">Loading flavors...</p>
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
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl mx-auto mb-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Manage Flavors</h2>

      <div className="mb-6 flex justify-end">
        <Button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700">
          Add New Flavor
        </Button>
      </div>

      {flavors.length === 0 ? (
        <div className="mt-8 p-4 text-center text-gray-600 bg-gray-50 rounded-md">
          No flavors defined yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Flavor Name</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Base Price/Liter</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flavors.map((flavor) => (
                <tr key={flavor.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                  <td className="py-3 px-4 text-sm text-gray-800">{flavor.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">Ksh {parseFloat(flavor.base_price_per_liter).toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${flavor.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {flavor.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm space-x-2">
                    <Button
                      onClick={() => openEditModal(flavor)}
                      className="bg-yellow-500 hover:bg-yellow-600 py-1 px-3 text-xs"
                      disabled={submittingAdd || submittingEdit}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => toggleFlavorActiveStatus(flavor)}
                      className={`${flavor.is_active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} py-1 px-3 text-xs`}
                      disabled={submittingAdd || submittingEdit}
                    >
                      {flavor.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add New Flavor Modal */}
      <Modal isOpen={isAddModalOpen} onClose={closeAddModal} title="Add New Flavor">
        <form onSubmit={handleAddFlavor}>
          <div className="space-y-4">
            <Input
              label="Flavor Name"
              id="newFlavorName"
              type="text"
              value={newFlavorName}
              onChange={(e) => setNewFlavorName(e.target.value)}
              required
            />
            <Input
              label="Base Price per Liter (Ksh)"
              id="newFlavorPrice"
              type="number"
              value={newFlavorPrice}
              onChange={(e) => setNewFlavorPrice(e.target.value)}
              min="0.01"
              step="0.01"
              required
            />
            {addFlavorError && <p className="text-red-500 text-sm">{addFlavorError}</p>}
            <div className="flex justify-end space-x-3 mt-6">
              <Button onClick={closeAddModal} className="bg-gray-500 hover:bg-gray-600" disabled={submittingAdd}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={submittingAdd}>
                {submittingAdd ? 'Adding...' : 'Add Flavor'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit Flavor Modal */}
      <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title={`Edit Flavor: ${currentFlavor?.name || ''}`}>
        <form onSubmit={handleEditFlavor}>
          <div className="space-y-4">
            <Input
              label="Flavor Name"
              id="editFlavorName"
              type="text"
              value={editFlavorName}
              onChange={(e) => setEditFlavorName(e.target.value)}
              required
            />
            <Input
              label="Base Price per Liter (Ksh)"
              id="editFlavorPrice"
              type="number"
              value={editFlavorPrice}
              onChange={(e) => setEditFlavorPrice(e.target.value)}
              min="0.01"
              step="0.01"
              required
            />
            <div className="flex items-center mt-4">
              <input
                id="editFlavorActive"
                type="checkbox"
                checked={editFlavorActive}
                onChange={(e) => setEditFlavorActive(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600 rounded"
              />
              <label htmlFor="editFlavorActive" className="ml-2 text-gray-700">Is Active</label>
            </div>
            {editFlavorError && <p className="text-red-500 text-sm">{editFlavorError}</p>}
            <div className="flex justify-end space-x-3 mt-6">
              <Button onClick={closeEditModal} className="bg-gray-500 hover:bg-gray-600" disabled={submittingEdit}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={submittingEdit}>
                {submittingEdit ? 'Updating...' : 'Update Flavor'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageFlavorsPage;
