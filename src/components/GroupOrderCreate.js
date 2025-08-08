import React, { useState } from 'react';
import { createGroupOrder } from '../api/apiClient';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const GroupOrderCreate = ({ restaurantId }) => {
  const [locationType, setLocationType] = useState('TABLE');
  const [tableId, setTableId] = useState('');
  const [locationDetails, setLocationDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQrCode, setShowQrCode] = useState(false);
  const [groupData, setGroupData] = useState(null);
  
  const { joinOrderGroup } = useCart();
  const navigate = useNavigate();

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    
    if (!restaurantId) {
      setError('Restaurant ID is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare location details object for delivery
      let locationDetailsObj = null;
      if (locationType === 'DELIVERY' && locationDetails) {
        locationDetailsObj = { address: locationDetails };
      }

      // Create the group order
      const response = await createGroupOrder(
        restaurantId,
        locationType,
        locationType === 'TABLE' ? tableId : null,
        locationDetailsObj
      );

      const newGroupData = response.data.data;
      setGroupData(newGroupData);
      setShowQrCode(true);

      // Join the group automatically
      joinOrderGroup(newGroupData);

      // Navigate to the restaurant menu with group ID
      navigate(`/restaurant/${restaurantId}?group=${newGroupData.id}`);
    } catch (error) {
      console.error('Error creating group order:', error);
      setError(error.response?.data?.error || 'Failed to create group order');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationTypeChange = (e) => {
    setLocationType(e.target.value);
    // Reset the other fields when changing type
    setTableId('');
    setLocationDetails('');
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Create a Group Order</h2>
      
      {showQrCode && groupData ? (
        <div className="text-center">
          <p className="mb-4">Share this code with others to join your group order:</p>
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <span className="text-xl font-bold">{groupData.qr_code}</span>
          </div>
          <button
            onClick={() => navigate(`/restaurant/${restaurantId}?group=${groupData.id}`)}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Continue to Menu
          </button>
        </div>
      ) : (
        <form onSubmit={handleCreateGroup}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Order Type:</label>
            <select
              className="w-full p-2 border border-gray-300 rounded"
              value={locationType}
              onChange={handleLocationTypeChange}
            >
              <option value="TABLE">Dine-in</option>
              <option value="PICKUP">Pickup</option>
              <option value="DELIVERY">Delivery</option>
            </select>
          </div>
          
          {locationType === 'TABLE' && (
            <div className="mb-4">
              <label htmlFor="tableId" className="block text-gray-700 mb-2">
                Table Number:
              </label>
              <input 
                type="text" 
                id="tableId"
                className="w-full p-2 border border-gray-300 rounded"
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                placeholder="Enter table number"
              />
            </div>
          )}
          
          {locationType === 'DELIVERY' && (
            <div className="mb-4">
              <label htmlFor="locationDetails" className="block text-gray-700 mb-2">
                Delivery Address:
              </label>
              <textarea 
                id="locationDetails"
                className="w-full p-2 border border-gray-300 rounded"
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                placeholder="Enter delivery address"
                rows={3}
              />
            </div>
          )}
          
          {error && (
            <div className="mb-4 text-red-500">{error}</div>
          )}
          
          <button 
            type="submit" 
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Group Order'}
          </button>
        </form>
      )}
    </div>
  );
};

export default GroupOrderCreate; 