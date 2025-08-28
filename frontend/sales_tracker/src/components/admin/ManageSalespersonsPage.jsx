import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select'; 

const ManageSalespersonsPage = () => {
  const token = useAuthStore((state) => state.token);
  const isAdmin = useAuthStore((state) => state.isAdmin());

  const [salespersons, setSalespersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for adding new salesperson modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newSalespersonError, setNewSalespersonError] = useState(null);
  const [submittingNewSalesperson, setSubmittingNewSalesperson] = useState(false);

  // --- Fetch Salespersons ---
  const fetchSalespersons = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!token) throw new Error('Authentication token not found.');
      if (!isAdmin) throw new Error('You do not have permission to view this page.');

      // Return UserProfile objects with nested User data
      const response = await fetch('http://localhost:8000/api/v1/users/?role=salesperson', {
        headers: { 'Authorization': `Token ${token}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ManageSalespersonsPage: Backend Error Data (Salespersons Fetch):', errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.detail || 'Failed to fetch salespersons.');
        } catch (jsonError) {
          throw new Error(`Failed to fetch salespersons: ${errorText.substring(0, 200)}... (Response was not JSON)`);
        }
      }
      const data = await response.json();
      setSalespersons(data.results || data); // Handle both paginated and non-paginated responses
      console.log('ManageSalespersonsPage: Fetched salespersons data:', data.results || data);
    } catch (err) {
      console.error('ManageSalespersonsPage: Error fetching salespersons:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && token) {
      fetchSalespersons();
    }
  }, [isAdmin, token]); // Re-fetch when admin status or token changes

  // --- Add Salesperson Modal Handlers ---
  const openAddModal = () => {
    setIsAddModalOpen(true);
    setNewUsername('');
    setNewEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setNewSalespersonError(null);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleAddNewSalesperson = async (e) => {
    e.preventDefault();
    setNewSalespersonError(null);
    if (newPassword !== confirmPassword) {
      setNewSalespersonError('Passwords do not match.');
      return;
    }

    setSubmittingNewSalesperson(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          username: newUsername,
          email: newEmail,
          password: newPassword,
          role: 'salesperson', 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('ManageSalespersonsPage: Backend Error Data (Add Salesperson):', errorData);
        // Handle field-specific errors if DRF returns them
        if (errorData.username) setNewSalespersonError(`Username: ${errorData.username[0]}`);
        else if (errorData.email) setNewSalespersonError(`Email: ${errorData.email[0]}`);
        else if (errorData.password) setNewSalespersonError(`Password: ${errorData.password[0]}`);
        else throw new Error(errorData.detail || 'Failed to add salesperson.');
      } else {
        console.log('Salesperson added successfully!');
        closeAddModal();
        fetchSalespersons(); // Refresh the list of salespersons
      }
    } catch (err) {
      console.error('ManageSalespersonsPage: Error adding salesperson:', err);
      setNewSalespersonError(err.message);
    } finally {
      setSubmittingNewSalesperson(false);
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
        <p className="text-gray-600 text-lg">Loading salespersons...</p>
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
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Manage Salespersons</h2>

      <div className="mb-6 flex justify-end">
        <Button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700">
          Add New Salesperson
        </Button>
      </div>

      {salespersons.length === 0 ? (
        <div className="mt-8 p-4 text-center text-gray-600 bg-gray-50 rounded-md">
          No salespersons registered yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Username</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                {/* <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {salespersons.map((sp) => (
                <tr key={sp.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                  <td className="py-3 px-4 text-sm text-gray-800">{sp.user.username}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{sp.user.email}</td>
                  <td className="py-3 px-4 text-sm text-gray-800 capitalize">{sp.role}</td>
                  <td className="py-3 px-4 text-sm space-x-2">
                    <Button className="bg-yellow-500 hover:bg-yellow-600 py-1 px-3 text-sm">Edit</Button>
                    <Button className="bg-red-500 hover:bg-red-600 py-1 px-3 text-sm">Delete</Button>
                  </td> 
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add New Salesperson Modal */}
      <Modal isOpen={isAddModalOpen} onClose={closeAddModal} title="Register New Salesperson">
        <form onSubmit={handleAddNewSalesperson}>
          <div className="space-y-4">
            <Input
              label="Username"
              id="newUsername"
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
            />
            <Input
              label="Email"
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm Password"
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {newSalespersonError && <p className="text-red-500 text-sm">{newSalespersonError}</p>}
            <div className="flex justify-end space-x-3 mt-6">
              <Button onClick={closeAddModal} className="bg-gray-500 hover:bg-gray-600" disabled={submittingNewSalesperson}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={submittingNewSalesperson}>
                {submittingNewSalesperson ? 'Adding...' : 'Add Salesperson'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageSalespersonsPage;