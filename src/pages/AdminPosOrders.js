import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminPosOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
    // Optionally, poll every 30s
    // const interval = setInterval(fetchOrders, 30000);
    // return () => clearInterval(interval);
  }, []);

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/admin/pos-orders');
      setOrders(res.data.orders);
    } catch (err) {
      setError('Failed to fetch orders');
    }
    setLoading(false);
  }

  async function retryPush(orderId) {
    setRetrying(orderId);
    setError(null);
    try {
      await axios.post(`/api/admin/pos-orders/${orderId}/retry`);
      fetchOrders();
    } catch (err) {
      setError('Retry failed: ' + (err.response?.data?.error || err.message));
    }
    setRetrying(null);
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>POS Push Monitoring</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User</th>
            <th>Restaurant</th>
            <th>Status</th>
            <th>Last POS Response</th>
            <th>Last POS Push Time</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 && (
            <tr><td colSpan={8}>No failed or pending POS pushes.</td></tr>
          )}
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.user_id}</td>
              <td>{order.restaurant_id}</td>
              <td>{order.pos_push_status}</td>
              <td>
                <pre style={{ maxWidth: 300, whiteSpace: 'pre-wrap', fontSize: 12 }}>
                  {order.pos_push_response}
                </pre>
              </td>
              <td>{order.pos_push_time}</td>
              <td>{order.created_at}</td>
              <td>
                <button
                  onClick={() => retryPush(order.id)}
                  disabled={retrying === order.id}
                >
                  {retrying === order.id ? 'Retrying...' : 'Retry'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 