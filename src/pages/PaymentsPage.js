import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { ChevronLeft } from "react-feather";
import apiClient from "../api/apiClient";
import { Helmet } from "react-helmet";

// Payment method configuration
const PAYMENT_METHODS = {
  gpay: {
    name: "Google Pay",
    logo: "/gpay-logo.png"
  },
  phonepe: {
    name: "PhonePe",
    logo: "/phonepe-logo.png"
  },
  paytm: {
    name: "Paytm UPI",
    logo: "/paytm-logo.png"
  }
};

const PaymentsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // First fetch order details to validate
      const orderResponse = await apiClient.get(`/orders/${orderId}`);
      
      // Check if we have a valid order response
      if (!orderResponse.data || !orderResponse.data.success) {
        throw new Error("Failed to fetch order details");
      }

      const orderData = orderResponse.data.data;
      
      // Get total amount from order or items
      let totalAmount = 0;
      
      // Try to get total from order first
      if (orderData.order?.total_amount) {
        // Check if the total_amount is a malformed string (contains multiple numbers)
        const totalAmountStr = orderData.order.total_amount.toString();
        if (totalAmountStr.includes('.') && totalAmountStr.split('.').length > 2) {
          // This is a malformed number, try to extract the correct value
          console.warn("Malformed total amount detected:", totalAmountStr);
          
          // Try to extract the first number before the second decimal point
          const parts = totalAmountStr.split('.');
          if (parts.length >= 2) {
            const firstPart = parts[0];
            const secondPart = parts[1].substring(0, 2); // Take only 2 decimal places
            totalAmount = parseFloat(`${firstPart}.${secondPart}`);
          } else {
            // If we can't parse it properly, calculate from items
            totalAmount = 0;
          }
        } else {
          // Normal case - just parse the number
          totalAmount = parseFloat(orderData.order.total_amount);
        }
      }
      
      // If no total from order or it's invalid, calculate from items
      if (!totalAmount || totalAmount <= 0 || isNaN(totalAmount)) {
        if (orderData.items?.length > 0) {
          totalAmount = orderData.items.reduce((sum, item) => {
            const itemTotal = parseFloat(item.unit_price) * item.quantity;
            return sum + itemTotal;
          }, 0);
        }
      }

      // Validate total amount
      if (!totalAmount || totalAmount <= 0 || isNaN(totalAmount)) {
        console.error("Invalid total amount:", totalAmount);
        throw new Error("Order has an invalid amount");
      }

      const { data } = await apiClient.get(`/payments/${orderId}`);
      
      // Validate required fields with more detailed checks
      if (!data) {
        throw new Error("No data received from the server");
      }

      // Convert totalAmount to number if it's a string
      const paymentTotalAmount = typeof data.totalAmount === 'string' 
        ? parseFloat(data.totalAmount) 
        : data.totalAmount;

      if (isNaN(paymentTotalAmount) || paymentTotalAmount <= 0) {
        console.error("Invalid total amount:", data.totalAmount);
        throw new Error("Invalid order amount");
      }

      // Update the data object with the parsed total amount
      data.totalAmount = paymentTotalAmount;

      if (!data.upiLinks || typeof data.upiLinks !== 'object') {
        console.error("Invalid UPI links:", data.upiLinks);
        throw new Error("No payment methods available");
      }

      setOrderDetails(data);
    } catch (err) {
      console.error("Error fetching order:", err);
      
      let errorMessage = "Failed to fetch order details";
      
      if (err.response?.status === 400) {
        if (err.response?.data?.error === "Invalid order amount.") {
          errorMessage = "This order has an invalid amount. Please contact support.";
        } else {
          errorMessage = err.response?.data?.error || "Invalid order request. Please try again.";
        }
      } else if (err.response?.status === 401) {
        errorMessage = "Please log in to continue";
        navigate('/login', { state: { from: location.pathname } });
      } else if (err.response?.status === 404) {
        errorMessage = "Order not found";
        navigate('/orders');
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [orderId, navigate, location, user]);

  // Fetch order details on component mount
  useEffect(() => {
    if (!orderId) {
      toast.error("Invalid order ID");
      navigate("/orders");
      return;
    }
    
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    fetchOrderDetails();
  }, [orderId, navigate, user, location.pathname, fetchOrderDetails]);

  const handlePayment = async (method) => {
    try {
      if (!orderDetails?.upiLinks?.[method]) {
        throw new Error("Payment method not available");
      }

      setSelectedMethod(method);
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(err.message || "Failed to process payment");
    }
  };

  const handlePayNow = async () => {
    try {
      if (!selectedMethod || !orderDetails?.upiLinks?.[selectedMethod]) {
        throw new Error("Please select a payment method");
      }
      
      // Get the UPI deep link
      const deepLink = orderDetails.upiLinks[selectedMethod];
      
      // Redirect to the UPI app
      window.location.href = deepLink;
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(err.message || "Failed to process payment");
    }
  };

  // Add a function to handle payment confirmation
  const handleConfirmPayment = async () => {
    setConfirming(true);
    try {
      // Call the backend to confirm payment and finalize the order
      const response = await apiClient.post(`/orders/${orderId}/confirm-payment`);
      if (response.data.success) {
        toast.success('Payment confirmed! Order placed.');
        navigate(`/orders/${orderId}`);
      } else {
        throw new Error(response.data.error || 'Failed to confirm payment');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to confirm payment');
    } finally {
      setConfirming(false);
    }
  };

  // Log the current state for debugging
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading payment details...</div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-gray-600">{error || "Unable to load payment details"}</p>
          <button 
            onClick={() => navigate('/orders')} 
            className="mt-4 text-blue-600 font-medium"
          >
            Go to Orders
          </button>
        </div>
      </div>
    );
  }

  // Filter available payment methods
  const availablePaymentMethods = Object.entries(orderDetails.upiLinks)
    .filter(([key]) => PAYMENT_METHODS[key])
    .map(([key, link]) => ({
      key,
      link,
      ...PAYMENT_METHODS[key]
    }));

  if (availablePaymentMethods.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-gray-600">No payment methods available</p>
          <button 
            onClick={() => navigate('/orders')} 
            className="mt-4 text-blue-600 font-medium"
          >
            Go to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Payment Options | DING! - Order food at your table</title>
        <meta name="description" content="Choose your preferred payment method and complete your food order securely. Multiple payment options available." />
        <meta name="keywords" content="food payment, online payment, secure checkout, payment methods, food delivery payment" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicons/16X16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicons/32X32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/assets/favicons/96X96.png" />
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white p-4 flex items-center gap-3 border-b">
          <button 
            onClick={() => navigate(-1)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-[15px] font-medium">Payment Options</h1>
            <p className="text-sm text-gray-600">
              Order #{orderId} • Total: ₹{orderDetails.totalAmount}
            </p>
          </div>
        </div>

        <div className="p-4">
          {/* UPI Section */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 flex items-center gap-2 border-b">
              <img src="/upi-logo.png" alt="UPI" className="h-5" />
              <span className="font-medium">Pay by any UPI App</span>
            </div>

            {/* Payment Methods */}
            <div className="divide-y">
              {availablePaymentMethods.map((method) => (
                <button
                  key={method.key}
                  onClick={() => handlePayment(method.key)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={method.logo} 
                      alt={method.name} 
                      className="h-8 w-8 object-contain"
                    />
                    <div>
                      <span className="font-medium">{method.name}</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    checked={selectedMethod === method.key}
                    onChange={() => {}}
                    className="h-5 w-5 text-blue-600"
                  />
                </button>
              ))}
            </div>

            {/* Pay Now Button */}
            {selectedMethod && (
              <div className="p-4 border-t">
                <button
                  onClick={handlePayNow}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {`Pay ₹${orderDetails.totalAmount} Now`}
                </button>
              </div>
            )}
          </div>

          {/* Order Status */}
          {orderDetails.status && (
            <div className="mt-4 text-sm text-gray-500 text-center">
              Order Status: {orderDetails.status}
            </div>
          )}

          {/* Confirm Payment Button for Pay_And_Place */}
          {orderDetails?.orderType === 'PAY_AND_PLACE' && (
            <div className="mt-4">
              <button
                onClick={handleConfirmPayment}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                disabled={confirming}
              >
                {confirming ? 'Confirming...' : 'I have completed the payment'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PaymentsPage;

