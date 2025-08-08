import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import AppBar from "../components/AppBar";
import { ChevronDown, ChevronUp, CheckCircle, Loader } from "react-feather";
import OrderGroupTrivia, { ReviewSlider } from "../components/OrderGroupTrivia";

function OrderReceivedTimerCard({ groupExpectedReadyTime, serverTime }) {
  const [remaining, setRemaining] = React.useState(null);
  React.useEffect(() => {
    if (!groupExpectedReadyTime || !serverTime) return;
    const ready = new Date(groupExpectedReadyTime).getTime();
    const server = new Date(serverTime).getTime();
    const client = Date.now();
    const offset = client - server;
    const update = () => {
      const now = Date.now() - offset;
      const diff = Math.max(0, Math.floor((ready - now) / 1000));
      setRemaining(diff);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [groupExpectedReadyTime, serverTime]);
  if (remaining === null) return null;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return (
    <div className="bg-white rounded-2xl shadow p-4 mb-4 flex items-center justify-between">
      <div className="flex-1">
        <h2 className="text-lg font-bold font-raleway mb-2">Order Received!</h2>
        {/* Timeline */}
        <div className="flex flex-col gap-2 ml-2 relative mb-2">
          <span className="absolute left-[9px] top-[22px] h-[52px] border-l-2 border-dashed border-gray-300 z-0"></span>
          <div className="flex items-start relative z-10">
            <span className="w-5 h-5 rounded-full bg-gray-300 mt-0.5 mr-2 flex-shrink-0 flex items-center justify-center">
              <Loader size={12} className="text-white" />
            </span>
            <span className="text-xs font-raleway">Kitchen accepted order</span>
          </div>
          <div className="flex items-start relative z-10">
            <span className="w-5 h-5 rounded-full bg-gray-300 mt-0.5 mr-2 flex-shrink-0 flex items-center justify-center">
              <Loader size={12} className="text-white" />
            </span>
            <span className="text-xs font-raleway">Order is being prepared</span>
          </div>
          <div className="flex items-start relative z-10">
            <span className="w-5 h-5 rounded-full bg-gray-300 mt-0.5 mr-2 flex-shrink-0 flex items-center justify-center">
              <Loader size={12} className="text-white" />
            </span>
            <span className="text-xs font-raleway">Order is served</span>
          </div>
        </div>
      </div>
      <div className="bg-[#c90024] text-white rounded-md px-2 py-1 flex flex-col items-center justify-center min-w-[44px] ml-4">
        <span className="text-[9px] font-bold font-raleway tracking-wider uppercase mb-1">ETA</span>
        <div className="flex flex-row items-end justify-center gap-1">
          <span className="text-2xl font-bold leading-none font-raleway">{String(mins).padStart(2, '0')}</span>
          <span className="text-xl font-bold leading-none font-raleway">:</span>
          <span className="text-2xl font-bold leading-none font-raleway">{String(secs).padStart(2, '0')}</span>
        </div>
        <div className="flex flex-row items-center justify-center gap-2 mt-0.5">
          <span className="text-[10px] font-raleway">mins</span>
          <span className="text-[10px] font-raleway">secs</span>
        </div>
      </div>
    </div>
  );
}

function OrderDetailsDropdown({ orders, group }) {
  const [expanded, setExpanded] = React.useState(false);
  
  // Sort orders by created_at time in descending order
  const sortedOrders = React.useMemo(() => {
    if (!orders) return [];
    return [...orders].sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return timeB - timeA;
    });
  }, [orders]);

  // Use backend values if available, otherwise fallback to calculation
  const subtotal = group?.subtotal_amount ?? (orders ? orders.reduce((sum, order) => {
    const orderTotal = order.items?.reduce((itemSum, item) => 
      itemSum + (Number(item.unit_price || item.price) * item.quantity), 0) || 0;
    return sum + orderTotal;
  }, 0) : 0);
  const gst = group?.gst_amount ?? (subtotal * 0.05);
  const totalAmount = group?.total_order_amount ?? (subtotal + gst);

  // Status pill logic (static for now, backend-ready)
  // In the future, replace 'Active' with group.order_status or similar
  const status = group?.order_status || 'Active';
  let statusColor = 'bg-green-100 text-green-800';
  if (status === 'In Progress') statusColor = 'bg-yellow-100 text-yellow-800';
  if (status === 'Served') statusColor = 'bg-blue-100 text-blue-800';

  return (
    <div className="bg-white rounded-2xl shadow p-4 mb-4">
      <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setExpanded(v => !v)}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold font-raleway">Order Details</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium font-raleway ${statusColor}`}>{status}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">₹{totalAmount.toFixed(2)}</span>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>
      {expanded && sortedOrders && sortedOrders.length > 0 && (
        <div className="mt-2 bg-gray-50 rounded-xl p-3">
          {/* Table and participants info */}
          <div className="flex justify-between text-xs font-raleway mb-2">
            <span>Table: <span className="font-semibold">{group.table_id || '-'}</span></span>
            <span>Participants: <span className="font-semibold">{group.participant_count || '-'}</span></span>
          </div>
          <hr className="my-2 border-gray-200" />
          {/* List of placed orders */}
          {sortedOrders.map(order => (
            <div key={order.id} className="mb-2">
              <div className="text-xs font-bold font-raleway mb-1">Order #{order.id}</div>
              {order.items && order.items.length > 0 ? (
                <ul className="ml-2">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="text-xs font-raleway flex justify-between">
                      <span>{item.quantity}x {item.item_name}</span>
                      <span>₹{Number(item.unit_price || item.price).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-gray-400 font-raleway ml-2">No items</div>
              )}
            </div>
          ))}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between text-xs font-raleway">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-raleway text-gray-500">
              <span>GST (5%)</span>
              <span>₹{gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold font-raleway mt-1">
              <span>Total</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const OrderGroupView = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);
  const [groupInfoExpanded, setGroupInfoExpanded] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    const fetchGroupStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/order-groups/${groupId}/status`);
        setGroup(response.data.data);
      } catch (err) {
        setError("Failed to load group order details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    if (groupId) fetchGroupStatus();
  }, [groupId]);

  const handleAddMoreItems = () => {
    if (group && group.restaurant_id) {
      let url = `/restaurant/${group.restaurant_id}`;
      if (group.table_number) {
        url += `?table=${group.table_number}`;
      }
      navigate(url);
    }
  };

  const handleGroupPay = async () => {
    navigate(`/payments-group/${groupId}`);
  };

  const isGroupClosed = group?.group_status && ["closed", "paid", "finalized"].includes(group.group_status.toLowerCase());

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading group order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Order group not found</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <AppBar 
        title="Order" 
        backUrl={group?.restaurant_id ? `/restaurant/${group.restaurant_id}` : '/'} 
      />
      <div className="flex-1 p-4 pb-24 max-w-3xl mx-auto w-full mt-14">
        {group.restaurant_name && (
          <>
            {/* Timer card with timeline and pill */}
            <OrderReceivedTimerCard 
                groupExpectedReadyTime={group.group_expected_ready_time}
                serverTime={group.server_time}
              />
            {/* Order Details Dropdown Section as a separate card */}
            <OrderDetailsDropdown orders={group.orders} group={group} />
            {/* Trivia Section */}
            <OrderGroupTrivia />
            {/* Review Slider Section */}
            <ReviewSlider restaurantId={group.restaurant_id} />
          </>
        )}
      </div>
      
      {/* Action buttons at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <div className="max-w-3xl mx-auto w-full flex gap-3">
          <button
            onClick={handleAddMoreItems}
            className="flex-1 border-2 border-[#c90024] text-[#c90024] py-2 px-3 rounded-md text-sm font-medium hover:bg-[#c90024] hover:text-white transition-colors font-raleway"
            disabled={isGroupClosed}
          >
            Add More Items
          </button>
          <button
            onClick={handleGroupPay}
            className={`flex-1 bg-[#c90024] text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-[#a8001d] transition-colors font-raleway ${isGroupClosed || paying ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={isGroupClosed || paying}
          >
            {paying ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              isGroupClosed ? "Paid" : `Pay ₹${group?.total_order_amount?.toFixed(2) || ''}`
            )}
          </button>
        </div>
        {payError && <div className="text-red-500 text-sm mt-2 font-raleway">{payError}</div>}
      </div>
    </div>
  );
};

export default OrderGroupView; 