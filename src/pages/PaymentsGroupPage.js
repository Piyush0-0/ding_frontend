import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { ChevronLeft } from "react-feather";
import apiClient from "../api/apiClient";

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

const PaymentsGroupPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [groupDetails, setGroupDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const fetchGroupDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch group status/details
      const response = await apiClient.get(`/order-groups/${groupId}/status`);
      if (!response.data || !response.data.success) {
        throw new Error("Failed to fetch group details");
      }
      const groupData = response.data.data;
      // Fetch group payment UPI links
      const paymentResp = await apiClient.get(`/payments/group/${groupId}`);
      if (!paymentResp.data || !paymentResp.data.upiLinks) {
        throw new Error("No payment methods available");
      }
      setGroupDetails({
        ...groupData,
        upiLinks: paymentResp.data.upiLinks,
        totalAmount: paymentResp.data.totalAmount || groupData.total_order_amount
      });
    } catch (err) {
      console.error("Error fetching group payment:", err);
      setError(err.message || "Failed to fetch group payment details");
      toast.error(err.message || "Failed to fetch group payment details");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (!groupId) {
      toast.error("Invalid group ID");
      navigate("/order-group");
      return;
    }
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    fetchGroupDetails();
  }, [groupId, user, location.pathname, fetchGroupDetails, navigate]);

  const handlePayment = (method) => {
    if (!groupDetails?.upiLinks?.[method]) {
      toast.error("Payment method not available");
      return;
    }
    setSelectedMethod(method);
  };

  const handlePayNow = async () => {
    try {
      if (!selectedMethod || !groupDetails?.upiLinks?.[selectedMethod]) {
        throw new Error("Please select a payment method");
      }
      
      // Initiate payment using the order-groups endpoint
      const response = await apiClient.post(`/order-groups/${groupId}/pay`);
      if (!response.data?.success) {
        throw new Error(response.data?.error || "Failed to initiate payment");
      }

      // Update local state with new group status
      setGroupDetails(prev => ({
        ...prev,
        group_status: 'pending_payment'
      }));

      // Redirect to UPI app
      window.location.href = groupDetails.upiLinks[selectedMethod];
    } catch (err) {
      toast.error(err.message || "Failed to process payment");
    }
  };

  const handleConfirmPayment = async () => {
    setConfirming(true);
    try {
      // Confirm the payment and update group status
      const response = await apiClient.post(`/order-groups/${groupId}/confirm-payment`);
      if (response.data.success) {
        toast.success("Group payment confirmed!");
        navigate(`/order-group/${groupId}`);
      } else {
        throw new Error(response.data.error || "Failed to confirm payment");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Failed to confirm payment");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading group payment details...</div>
      </div>
    );
  }

  if (error || !groupDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-gray-600">{error || "Unable to load group payment details"}</p>
          <button 
            onClick={() => navigate('/order-group/' + groupId)} 
            className="mt-4 text-blue-600 font-medium"
          >
            Go to Group Order
          </button>
        </div>
      </div>
    );
  }

  const availablePaymentMethods = Object.entries(groupDetails.upiLinks)
    .filter(([key]) => PAYMENT_METHODS[key])
    .map(([key, link]) => ({
      key,
      link,
      ...PAYMENT_METHODS[key]
    }));

  return (
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
          <h1 className="text-[15px] font-medium">Group Payment Options</h1>
          <p className="text-sm text-gray-600">
            Group #{groupId} • Total: ₹{groupDetails.totalAmount}
          </p>
        </div>
      </div>
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 flex items-center gap-2 border-b">
            <img src="/upi-logo.png" alt="UPI" className="h-5" />
            <span className="font-medium">Pay by any UPI App</span>
          </div>
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
          {selectedMethod && (
            <div className="p-4 border-t">
              <button
                onClick={handlePayNow}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {`Pay ₹${groupDetails.totalAmount} Now`}
              </button>
            </div>
          )}
        </div>
        {/* Confirm Payment Button */}
        <div className="mt-4">
          <button
            onClick={handleConfirmPayment}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
            disabled={confirming}
          >
            {confirming ? "Confirming..." : "I have completed the payment"}
          </button>
        </div>
        {/* Group Status */}
        {groupDetails.group_status && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Group Status: {groupDetails.group_status}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsGroupPage; 