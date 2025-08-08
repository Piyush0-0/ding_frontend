import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import { useAuth } from "../contexts/AuthContext";
import { Helmet } from "react-helmet";
import AppBar from "../components/AppBar";
import OrderGroupTrivia, { ReviewSlider } from "../components/OrderGroupTrivia";

const OrderTimer = ({ expectedReadyTime, serverTime }) => {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!expectedReadyTime || !serverTime) return;
    
    const ready = new Date(expectedReadyTime).getTime();
    const server = new Date(serverTime).getTime();
    const client = Date.now();
    const offset = client - server;
    
    const updateRemaining = () => {
      setRemaining(Math.max(0, Math.floor((ready - (Date.now() - offset)) / 1000)));
    };
    
    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [expectedReadyTime, serverTime]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
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
  );
};

const OrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [pickupEta, setPickupEta] = useState(10);
  const [pickupLoading, setPickupLoading] = useState(false);
  const [pickupSuccess, setPickupSuccess] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!user) {
          navigate('/login', { state: { from: `/orders/${orderId}` } });
          return;
        }

        const response = await apiClient.get(`/orders/${orderId}`);
        console.log("Order response:", response.data);
        
        // Extract order and items from response
        const respData = response.data.data;
        const orderData = respData.order;
        const itemsData = respData.items;
        const expectedReadyTime = respData.expected_ready_time;
        const serverTime = respData.server_time;
        
        // Calculate total amount from items if not provided in order
        let totalAmount = 0;
        if (itemsData && itemsData.length > 0) {
          totalAmount = itemsData.reduce((sum, item) => {
            const itemTotal = parseFloat(item.item_total) || 0;
            return sum + itemTotal;
          }, 0);
        }
        
        // Set order with calculated total if not provided
        setOrder({
          ...orderData,
          total_amount: orderData.total_amount || totalAmount,
          expected_ready_time: expectedReadyTime,
          server_time: serverTime
        });
        
        setItems(itemsData);
        setCalculatedTotal(totalAmount);
        
        // Fetch restaurant details if not included in the order response
        if (orderData?.restaurant_id) {
          const restaurantResponse = await apiClient.get(
            `/restaurants/${orderData.restaurant_id}`
          );
          setRestaurant(restaurantResponse.data.restaurant);
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to load order details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, navigate, user]);

  const handlePayment = () => {
    navigate(`/payments/${orderId}`);
  };

  const getStatusBadgeClass = (status) => {
    // Convert to lowercase for case-insensitive comparison
    const statusLower = status?.toLowerCase() || '';
    
    switch (statusLower) {
      case "open":
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "payment_pending":
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-purple-100 text-purple-800";
      case "completed":
      case "ready":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    // Convert to lowercase for case-insensitive comparison
    const statusLower = status?.toLowerCase() || '';
    
    switch (statusLower) {
      case "open":
      case "pending":
        return "Pending";
      case "payment_pending":
      case "pending_payment":
        return "Payment Pending";
      case "confirmed":
        return "Confirmed";
      case "preparing":
        return "Preparing";
      case "completed":
      case "ready":
        return "Ready";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status || "Unknown";
    }
  };

  // Countdown timer for expected ready time
  const TimerView = ({ groupExpectedReadyTime, serverTime }) => {
    const [remaining, setRemaining] = useState(null);
    useEffect(() => {
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
      <div className="bg-white rounded-lg shadow mb-4">
        <div className="p-4">
          <h2 className="text-base font-semibold mb-3 text-[#ff5722] font-raleway">
            Expected Ready Time
          </h2>
          <div className="text-center py-4 text-2xl font-medium text-gray-800 font-raleway">
            {mins} mins {secs} secs
          </div>
        </div>
      </div>
    );
  };

  // Helper: get trivia array
  const getTriviaArray = () => {
    if (!restaurant) return [];
    if (Array.isArray(restaurant.trivia)) return restaurant.trivia;
    if (typeof restaurant.trivia === 'string' && restaurant.trivia.trim()) return [restaurant.trivia];
    // Sample fallback trivia
    return [
      'This restaurant has a rich story, unique stats, and fun facts. Click to learn more about its journey, awards, and what makes it special!',
      'Did you know? This restaurant serves over 10,000 customers every month!',
      'The chef has won multiple culinary awards for their signature dishes.',
      'The signature dish here was inspired by a 100-year-old family recipe.',
      'This restaurant sources 90% of its ingredients from local farmers.',
      'The interior design was inspired by the streets of Paris.'
    ];
  };
  const triviaArray = getTriviaArray();

  // Auto-advance trivia every 5 seconds
  useEffect(() => {
    if (triviaArray.length <= 1) return;
    const timer = setTimeout(() => {
      setTriviaIndex((prev) => (prev + 1) % triviaArray.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [triviaIndex, triviaArray.length]);

  // Handler for pickup notification
  const handlePickupNotify = async () => {
    setPickupLoading(true);
    try {
      await apiClient.post(`/orders/${orderId}/pickup-ready`, { eta_minutes: pickupEta });
      setPickupSuccess(true);
      setShowPickupModal(false);
      // Refetch order details to update status and pickup fields
      setTimeout(() => setPickupSuccess(false), 3000);
      // Optionally, refetch order details after a short delay
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      alert('Failed to notify restaurant. Please try again.');
    } finally {
      setPickupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
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

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Order not found</p>
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
    <>
      <Helmet>
        <title>Order Details | DING! - Order food at your table</title>
        <meta name="description" content="Track your food order status, view order details, and get real-time updates on your delivery." />
        <meta name="keywords" content="order tracking, food delivery status, order details, delivery updates" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicons/16X16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicons/32X32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/assets/favicons/96X96.png" />
      </Helmet>
      <div className="min-h-screen flex flex-col bg-gray-100">
        <AppBar title={`Order #${orderId}`} showBack={false} />
        <div className="flex-1 p-4 pb-24 max-w-3xl mx-auto w-full mt-14">
          {/* Timer/Timeline Card (like order-group) */}
          {order && (
            <div className="bg-white rounded-2xl shadow p-4 mb-4 flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-lg font-bold font-raleway mb-2">Order Received!</h2>
                {/* Timeline */}
                <div className="flex flex-col gap-2 ml-2 relative mb-2">
                  <span className="absolute left-[9px] top-[22px] h-[52px] border-l-2 border-dashed border-gray-300 z-0"></span>
                  <div className="flex items-start relative z-10">
                    <span className="w-5 h-5 rounded-full bg-gray-300 mt-0.5 mr-2 flex-shrink-0 flex items-center justify-center">
                      <span className="w-2 h-2 bg-white rounded-full block"></span>
                    </span>
                    <span className="text-xs font-raleway">Order placed</span>
                  </div>
                  <div className="flex items-start relative z-10">
                    <span className="w-5 h-5 rounded-full bg-gray-300 mt-0.5 mr-2 flex-shrink-0 flex items-center justify-center">
                      <span className="w-2 h-2 bg-white rounded-full block"></span>
                    </span>
                    <span className="text-xs font-raleway">Order is being prepared</span>
                  </div>
                  <div className="flex items-start relative z-10">
                    <span className="w-5 h-5 rounded-full bg-gray-300 mt-0.5 mr-2 flex-shrink-0 flex items-center justify-center">
                      <span className="w-2 h-2 bg-white rounded-full block"></span>
                    </span>
                    <span className="text-xs font-raleway">Order is served</span>
                  </div>
                </div>
              </div>
              {order.expected_ready_time && order.server_time && (
                <OrderTimer 
                  expectedReadyTime={order.expected_ready_time}
                  serverTime={order.server_time}
                />
              )}
            </div>
          )}
          {/* Trivia Section */}
          <OrderGroupTrivia />
          {/* Review Slider Section */}
          {restaurant && <ReviewSlider restaurantId={restaurant.id} />}

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow mb-4 p-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-lg font-bold font-raleway">Order #{orderId}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium font-raleway ${getStatusBadgeClass(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2 font-raleway">
                <span className="font-raleway">Order Type:</span>
                <span className="font-medium font-raleway">
                  {order.order_type === 'PICKUP'
                    ? 'Pickup (Collect at counter)'
                    : order.order_type === 'PAY_AND_PLACE'
                      ? 'Pay and Place Order'
                      : order.order_type === 'PAY_AT_END'
                        ? 'Pay at the Restaurant'
                        : order.order_type}
                </span>
              </div>
              {/* Show pickup ETA and time if present */}
              {order.order_type === 'PICKUP' && order.pickup_eta_minutes && order.pickup_requested_at && (
                <div className="flex justify-between text-sm text-gray-600 mb-2 font-raleway">
                  <span className="font-raleway">Pickup ETA:</span>
                  <span className="font-medium font-raleway">{order.pickup_eta_minutes} min (Notified at {new Date(order.pickup_requested_at).toLocaleTimeString()})</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600 mb-2 font-raleway">
                <span className="font-raleway">Payment Status:</span>
                <span className="font-medium font-raleway">
                  {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 font-raleway">
                <span className="font-raleway">Order Date:</span>
                <span className="font-medium font-raleway">
                  {new Date(order.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow mb-4 p-4">
            <h2 className="text-base font-semibold mb-3 font-raleway">Order Items</h2>
            {items.length > 0 ? (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium font-raleway">{item.item_name}</p>
                        {item.variation_name && (
                          <p className="text-sm text-gray-600 font-raleway">
                            {item.variation_name}
                          </p>
                        )}
                        {item.addons && item.addons.length > 0 && (
                          <div className="text-sm text-gray-600 font-raleway">
                            <p>Add-ons:</p>
                            <ul className="list-disc list-inside">
                              {item.addons.map((addon) => (
                                <li key={addon.id} className="font-raleway">{addon.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <p className="text-sm text-gray-600 font-raleway">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium font-raleway">₹{Number(item.unit_price || item.price).toFixed(2)}</p>
                        <p className="text-sm text-gray-600 font-raleway">
                          Total: ₹{Number(item.item_total).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 font-raleway">No items in this order</p>
            )}
          </div>

          {/* Bill Details */}
          <div className="bg-white rounded-lg shadow mb-4 p-4">
            <h2 className="text-base font-semibold mb-3 font-raleway">Bill Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600 font-raleway">
                <span className="font-raleway">Item Total</span>
                <span className="font-raleway">₹{calculatedTotal.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-gray-900 font-raleway">
                  <span className="font-raleway">Total</span>
                  <span className="font-raleway">₹{calculatedTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons and status messages */}
          {order.status === "ORDER_IN_PROGRESS" && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={handlePayment}
                className="flex-1 border-2 border-[#c90024] text-[#c90024] py-2 px-3 rounded-md text-sm font-medium hover:bg-[#c90024] hover:text-white transition-colors font-raleway"
              >
                Checkout
              </button>
              <button
                onClick={() => navigate(`/restaurant/${order?.restaurant_id}`)}
                className="flex-1 bg-[#c90024] text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-[#a8001d] transition-colors font-raleway"
              >
                Place another order
              </button>
            </div>
          )}

          {order.status === "PAYMENT_PENDING" && (
            <div className="mt-4">
              <button
                onClick={handlePayment}
                className="w-full bg-[#c90024] text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-[#a8001d] transition-colors font-raleway"
              >
                Complete Payment
              </button>
            </div>
          )}

          {order.status === "CONFIRMED" && (
            <div className="mt-4">
              <div className="bg-blue-50 p-4 rounded-md text-blue-800">
                <p className="font-medium font-raleway">Your order has been confirmed!</p>
                <p className="text-sm mt-1 font-raleway">
                  The restaurant is preparing your order. You will be notified when it's ready.
                </p>
              </div>
            </div>
          )}

          {order.status === "PREPARING" && (
            <div className="mt-4">
              <div className="bg-purple-50 p-4 rounded-md text-purple-800">
                <p className="font-medium font-raleway">Your order is being prepared!</p>
                <p className="text-sm mt-1 font-raleway">
                  The restaurant is working on your order. It will be ready soon.
                </p>
              </div>
            </div>
          )}

          {order.status === "COMPLETED" && (
            <div className="mt-4">
              <div className="bg-green-50 p-4 rounded-md text-green-800">
                <p className="font-medium font-raleway">Order completed!</p>
                <p className="text-sm mt-1 font-raleway">
                  Thank you for your order. We hope you enjoyed your meal!
                </p>
              </div>
            </div>
          )}

          {order.status === "CANCELLED" && (
            <div className="mt-4">
              <div className="bg-red-50 p-4 rounded-md text-red-800">
                <p className="font-medium font-raleway">Order cancelled</p>
                <p className="text-sm mt-1 font-raleway">
                  This order has been cancelled. If you believe this is an error, please contact support.
                </p>
              </div>
            </div>
          )}

          {/* Pay at Restaurant actions - show for appropriate statuses */}
          {order.order_type === 'PAY_AT_END' && 
           (order.order_status === 'pending' || 
            order.order_status === 'confirmed' || 
            order.order_status === 'preparing' || 
            order.order_status === 'ready' ||
            order.status === 'pending' || 
            order.status === 'confirmed' || 
            order.status === 'preparing' || 
            order.status === 'ready') && 
           order.payment_status !== 'SUCCESS' && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={handlePayment}
                className="flex-1 bg-[#c90024] text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-[#a8001d] transition-colors font-raleway"
              >
                Pay Now
              </button>
              <button
                onClick={() => navigate(`/restaurant/${order?.restaurant_id}`)}
                className="flex-1 border-2 border-[#c90024] text-[#c90024] py-2 px-3 rounded-md text-sm font-medium hover:bg-[#c90024] hover:text-white transition-colors font-raleway"
              >
                Add More Items
              </button>
            </div>
          )}

          {/* Pickup: Show 'I'm on my way' button if not yet notified/preparing */}
          {order.order_type === 'PICKUP' &&
            (!order.pickup_requested_at ||
              !['preparing', 'ready', 'delivered'].includes((order.order_status || '').toLowerCase())) &&
            (order.payment_status || '').toLowerCase() === 'paid' && (
              <div className="mb-4">
                <button
                  className="w-full bg-[#c90024] text-white py-2 px-3 rounded-md text-sm font-medium font-raleway hover:bg-[#a8001d] transition-colors"
                  onClick={() => setShowPickupModal(true)}
                  disabled={pickupLoading}
                >
                  {pickupLoading ? 'Notifying...' : "I'm on my way"}
                </button>
                {pickupSuccess && (
                  <div className="mt-2 text-green-600 text-sm font-raleway">Restaurant notified! Your order will be prepared for pickup.</div>
                )}
              </div>
            )}

          {/* Pickup ETA Modal */}
          {showPickupModal && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
                <h2 className="text-lg font-bold mb-4 font-raleway">When will you arrive?</h2>
                <select
                  className="w-full border border-gray-300 rounded-md py-2 px-3 mb-4 font-raleway"
                  value={pickupEta}
                  onChange={e => setPickupEta(Number(e.target.value))}
                  disabled={pickupLoading}
                >
                  {[5, 10, 15, 20, 25, 30].map(min => (
                    <option key={min} value={min}>{min} minutes</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    className="flex-1 bg-[#c90024] text-white py-2 px-3 rounded-md font-medium font-raleway hover:bg-[#a8001d] transition-colors"
                    onClick={handlePickupNotify}
                    disabled={pickupLoading}
                  >
                    {pickupLoading ? 'Notifying...' : 'Notify Restaurant'}
                  </button>
                  <button
                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded-md font-medium font-raleway hover:bg-gray-100 transition-colors"
                    onClick={() => setShowPickupModal(false)}
                    disabled={pickupLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderPage; 