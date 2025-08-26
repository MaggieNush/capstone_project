import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import Button from '../common/Button';
import Modal from '../common/Modal'; 
import Input from '../common/Input'; 

const PendingClientsPage = () => {
  const [pendingClients, setPendingClients] = useState([]);
  const [salespersons, setSalespersons] = useState([]); // For assigning clients
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClientForApproval, setSelectedClientForApproval] = useState(null);
  const [selectedSalespersonId, setSelectedSalespersonId] = useState('');
  const [actionError, setActionError] = useState(null); // Error for approve/reject actions
  const [submittingAction, setSubmittingAction] = useState(false);

  const token = useAuthStore((state) => state.token);

  // --- Fetch Pending Clients ---
  useEffect(() => {
    const fetchPendingClients = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:8000/api/v1/clients/?status=pending_approval`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch pending clients.');
        }

        const data = await response.json();
        setPendingClients(data.results || data); // Handle both paginated and non-paginated responses
      } catch (err) {
        console.error('PendingClientsPage: Error fetching pending clients:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPendingClients();
    }
  }, [token, submittingAction]); // Re-fetch when an action is submitted

  // --- Fetch Salespersons for Assignment (when modal opens) ---
  useEffect(() => {
    if (isModalOpen && !salespersons.length) { // Only fetch if modal is open and salespersons not yet loaded
      const fetchSalespersons = async () => {
        try {
          const response = await fetch(`http://localhost:8000/api/v1/users/?role=salesperson`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Token ${token}`,
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to fetch salespersons.');
          }
          const data = await response.json();
          setSalespersons(data.results || data); // Assuming users endpoint might also paginate
        } catch (err) {
          console.error('PendingClientsPage: Error fetching salespersons:', err);
          setActionError(err.message); // Use actionError for modal-specific errors
        }
      };
      if (token) {
        fetchSalespersons();
      }
    }
  }, [isModalOpen, token, salespersons.length]);


  // --- Action Handlers ---

  const openApproveModal = (client) => {
    setSelectedClientForApproval(client);
    setSelectedSalespersonId(''); // Reset selection
    setActionError(null);
    setIsModalOpen(true);
  };

  const closeApproveModal = () => {
    setIsModalOpen(false);
    setSelectedClientForApproval(null);
    setSelectedSalespersonId('');
    setActionError(null);
  };

  const handleApproveClient = async () => {
    if (!selectedSalespersonId) {
      setActionError('Please select a salesperson.');
      return;
    }
    if (!selectedClientForApproval) return;

    setActionError(null);
    setSubmittingAction(true);

    try {
      const response = await fetch(`http://localhost:8000/api/v1/clients/${selectedClientForApproval.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          status: 'approved',
          assigned_salesperson_id: selectedSalespersonId, // Send the ID
          is_new_client: false, // Mark as no longer new
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to approve client.');
      }

      console.log('Client approved successfully:', selectedClientForApproval.name);
      closeApproveModal();
      setPendingClients(prev => prev.filter(c => c.id !== selectedClientForApproval.id)); // Remove from list
    } catch (err) {
      console.error('PendingClientsPage: Error approving client:', err);
      setActionError(err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRejectClient = async (client) => {
    if (!window.confirm(`Are you sure you want to reject client "${client.name}"?`)) { // Temporarily using confirm
      return;
    }
    setActionError(null);
    setSubmittingAction(true);

    try {
      const response = await fetch(`http://localhost:8000/api/v1/clients/${client.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          status: 'rejected',
          assigned_salesperson_id: null, // Clear assignment if any
          is_new_client: false, // No longer considered new
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to reject client.');
      }

      console.log('Client rejected successfully:', client.name);
      setPendingClients(prev => prev.filter(c => c.id !== client.id)); // Remove from list
    } catch (err) {
      console.error('PendingClientsPage: Error rejecting client:', err);
      setActionError(err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  // --- Conditional Rendering ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-600 text-lg">Loading pending client requests...</p>
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
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Pending Client Requests</h2>

      {pendingClients.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No pending client requests at this time.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client Name</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Requested By</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone/Email</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingClients.map((client) => (
                <tr key={client.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                  <td className="py-3 px-4 text-sm text-gray-800">{client.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-800 capitalize">{client.client_type}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{client.requested_by_salesperson?.user?.username || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{client.phone_number || client.email || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm space-x-2">
                    <Button
                      onClick={() => openApproveModal(client)}
                      className="bg-green-600 hover:bg-green-700 py-1 px-3 text-sm"
                      disabled={submittingAction}
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleRejectClient(client)}
                      className="bg-red-600 hover:bg-red-700 py-1 px-3 text-sm"
                      disabled={submittingAction}
                    >
                      Reject
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Approve Client Modal */}
      <Modal isOpen={isModalOpen} onClose={closeApproveModal} title={`Approve Client: ${selectedClientForApproval?.name || ''}`}>
        <div className="space-y-4">
          <p className="text-gray-700">Select a salesperson to assign to this client upon approval.</p>
          <div className="mb-4">
            <label htmlFor="salespersonSelect" className="block text-gray-700 text-sm font-bold mb-2">
              Assign Salesperson
            </label>
            <select
              id="salespersonSelect"
              value={selectedSalespersonId}
              onChange={(e) => setSelectedSalespersonId(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
              required
            >
              <option value="">-- Select Salesperson --</option>
              {salespersons.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.user.username}
                </option>
              ))}
            </select>
          </div>
          {actionError && <p className="text-red-500 text-sm">{actionError}</p>}
          <div className="flex justify-end space-x-3 mt-6">
            <Button onClick={closeApproveModal} className="bg-gray-500 hover:bg-gray-600" disabled={submittingAction}>
              Cancel
            </Button>
            <Button onClick={handleApproveClient} className="bg-blue-600 hover:bg-blue-700" disabled={submittingAction || !selectedSalespersonId}>
              {submittingAction ? 'Approving...' : 'Approve Client'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PendingClientsPage;