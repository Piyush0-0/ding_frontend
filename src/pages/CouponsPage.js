import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle } from 'react-feather';
import apiClient from '../api/apiClient';
import { getSessionId } from '../utils/session';
import { Helmet } from "react-helmet";

const CouponsPage = () => {
  const navigate = useNavigate();
  const sessionId = getSessionId();
  const [appliedCoupon, setAppliedCoupon] = useState(localStorage.getItem('selectedCoupon'));
  const [error, setError] = useState(null);

  // Sample coupon data - replace with actual API data
  const coupons = [
    {
      id: 1,
      code: 'WELCOME50',
      name: 'Welcome Offer',
      description: 'Get 50% off on your first order',
      minOrderAmount: 200,
      discount: 50,
      discountType: 'PERCENTAGE'
    },
    {
      id: 2,
      code: 'FLAT100',
      name: 'Flat Discount',
      description: 'Get ₹100 off on orders above ₹500',
      minOrderAmount: 500,
      discount: 100,
      discountType: 'FLAT'
    },
    {
      id: 3,
      code: 'FREESHIP',
      name: 'Free Delivery',
      description: 'Free delivery on orders above ₹300',
      minOrderAmount: 300,
      discount: 0,
      discountType: 'FREE_DELIVERY'
    }
  ];

  const handleApplyCoupon = async (couponCode) => {
    try {
      const response = await apiClient.post("/cart/apply-coupon", {
        session_id: sessionId,
        coupon_code: couponCode
      });
      
      if (response.data) {
        // Store the selected coupon in localStorage
        localStorage.setItem('selectedCoupon', couponCode);
        setAppliedCoupon(couponCode);
        // Navigate back to cart
        navigate('/cart');
      }
    } catch (error) {
      console.error("Failed to apply coupon:", error);
      setError("Invalid or expired coupon code");
    }
  };

  return (
    <>
      <Helmet>
        <title>Available Coupons | DING! - Order food at your table</title>
        <meta name="description" content="Browse and apply available coupons to get discounts on your food orders. Save money on your favorite restaurants." />
        <meta name="keywords" content="food coupons, discount codes, restaurant deals, food delivery discounts" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicons/16X16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicons/32X32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/assets/favicons/96X96.png" />
      </Helmet>
      <div className="min-h-screen bg-gray-100">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white shadow-sm z-10">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-lg font-medium font-raleway">APPLY COUPON</h1>
          </div>
        </div>

        {error && (
          <div className="max-w-3xl mx-auto px-4 py-2">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded font-raleway">
              {error}
            </div>
          </div>
        )}

        {/* Coupon Cards */}
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="space-y-4">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 font-raleway">
                      {coupon.name}
                    </h3>
                    <p className="text-sm text-gray-500 font-raleway mt-1">
                      {coupon.description}
                    </p>
                    <p className="text-xs text-gray-400 font-raleway mt-2">
                      Min. order: ₹{coupon.minOrderAmount}
                    </p>
                  </div>
                  {appliedCoupon === coupon.code ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-500" size={20} />
                      <span className="text-green-500 text-sm font-raleway">Applied</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleApplyCoupon(coupon.code)}
                      className="bg-[#c90024] text-white px-4 py-2 rounded-md text-sm font-raleway hover:bg-[#a8001d] transition-colors"
                    >
                      Apply
                    </button>
                  )}
                </div>
                <div className="mt-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-raleway">
                    {coupon.code}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CouponsPage; 