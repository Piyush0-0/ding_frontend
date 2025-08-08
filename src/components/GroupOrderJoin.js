import React, { useState } from 'react';
import { getGroupOrderByCode, joinGroupOrder } from '../api/apiClient';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const GroupOrderJoin = () => {
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { joinOrderGroup } = useCart();
  const navigate = useNavigate();

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    
    if (!qrCode) {
      setError('Please enter a QR code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First, get the group order details
      const groupResponse = await getGroupOrderByCode(qrCode);
      const groupData = groupResponse.data.data;

      if (!groupData) {
        setError('Invalid QR code or group order not found');
        return;
      }

      // Join the group order
      await joinGroupOrder(groupData.id);

      // Update the cart context
      joinOrderGroup(groupData);

      // Navigate to the restaurant menu page with group order ID
      navigate(`/restaurant/${groupData.restaurant_id}?group=${groupData.id}`);
    } catch (error) {
      console.error('Error joining group order:', error);
      setError(error.response?.data?.error || 'Failed to join group order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Join a Group Order</h2>
      <form onSubmit={handleJoinGroup}>
        <div className="mb-4">
          <label htmlFor="qrCode" className="block text-gray-700 mb-2">
            Enter QR Code:
          </label>
          <input 
            type="text" 
            id="qrCode"
            className="w-full p-2 border border-gray-300 rounded"
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value)}
            placeholder="Enter the QR code"
          />
        </div>
        
        {error && (
          <div className="mb-4 text-red-500">{error}</div>
        )}
        
        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Joining...' : 'Join Group Order'}
        </button>
      </form>
    </div>
  );
};

export default GroupOrderJoin; 