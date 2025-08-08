import React, { useState, useEffect } from 'react';
import { getGroupOrderStatus, finalizeGroupOrder } from '../api/apiClient';
import { useCart } from '../contexts/CartContext';

const GroupOrderStatus = ({ groupId, showControls = false }) => {
  const [groupStatus, setGroupStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(null);
  const { isInOrderGroup, leaveOrderGroup } = useCart();

  // Fetch group order status
  const fetchGroupStatus = async () => {
    if (!groupId) return;
    
    try {
      const response = await getGroupOrderStatus(groupId);
      setGroupStatus(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching group order status:', err);
      setError('Failed to load group order status');
      
      // If the group is no longer active, leave it
      if (err.response?.status === 404 && isInOrderGroup()) {
        leaveOrderGroup();
      }
    } finally {
      setLoading(false);
    }
  };

  // Set up polling to refresh the group status periodically
  useEffect(() => {
    fetchGroupStatus();
    
    // Set up interval to refresh every 10 seconds
    const interval = setInterval(fetchGroupStatus, 10000);
    setRefreshInterval(interval);
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [groupId]);

  // Handle finalizing the group order (for restaurant staff)
  const handleFinalizeGroup = async () => {
    try {
      await finalizeGroupOrder(groupId);
      await fetchGroupStatus();
    } catch (err) {
      console.error('Error finalizing group order:', err);
      setError('Failed to finalize group order');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading group order details...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  if (!groupStatus) {
    return <div className="text-center py-4">Group order not found</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h2 className="text-xl font-semibold mb-2">Group Order Status</h2>
      
      <div className="mb-4">
        <p className="text-gray-700">
          <span className="font-medium">Restaurant:</span> {groupStatus.restaurant_name}
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Location Type:</span> {groupStatus.location_type}
        </p>
        {groupStatus.location_type === 'TABLE' && groupStatus.table_id && (
          <p className="text-gray-700">
            <span className="font-medium">Table:</span> {groupStatus.table_id}
          </p>
        )}
        <p className="text-gray-700">
          <span className="font-medium">Status:</span> {groupStatus.group_status}
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Participants:</span> {groupStatus.participant_count}
        </p>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Orders</h3>
        {groupStatus.orders.length === 0 ? (
          <p className="text-gray-500">No orders yet</p>
        ) : (
          <div className="space-y-2">
            {groupStatus.orders.map(order => (
              <div key={order.id} className="border-b pb-2">
                <div className="flex justify-between">
                  <span>{order.user_name}</span>
                  <span className="font-medium">₹{order.total_amount}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Status: {order.order_status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {groupStatus.pending_carts.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Pending Carts</h3>
          <div className="space-y-2">
            {groupStatus.pending_carts.map(cart => (
              <div key={cart.id} className="border-b pb-2">
                <div className="flex justify-between">
                  <span>{cart.user_name}</span>
                  <span className="font-medium">₹{cart.total_amount || 0}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Items: {cart.item_count || 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-4 bg-gray-100 p-3 rounded-lg">
        <div className="flex justify-between font-medium">
          <span>Current Total:</span>
          <span>₹{groupStatus.total_order_amount}</span>
        </div>
        {groupStatus.potential_total_amount > groupStatus.total_order_amount && (
          <div className="flex justify-between text-gray-600">
            <span>Potential Total:</span>
            <span>₹{groupStatus.potential_total_amount}</span>
          </div>
        )}
      </div>
      
      {showControls && groupStatus.group_status === 'active' && (
        <div className="mt-4">
          <button
            onClick={handleFinalizeGroup}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Finalize Group Order
          </button>
        </div>
      )}
    </div>
  );
};

export default GroupOrderStatus; 