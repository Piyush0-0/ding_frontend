import React, { useEffect } from 'react';
import { CheckCircle } from 'react-feather';

const OrderSuccessSplash = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000); // Show splash for 2 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2 font-raleway">Order Placed Successfully!</h2>
        <p className="text-gray-600 font-raleway">Redirecting to order details...</p>
      </div>
    </div>
  );
};

export default OrderSuccessSplash; 