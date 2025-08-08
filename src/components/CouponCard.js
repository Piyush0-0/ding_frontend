import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const CouponCard = ({ appliedCoupon, discountAmount, onRemoveCoupon }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold font-raleway">Coupons</h2>
        <button
          onClick={() => navigate('/coupons')}
          className="text-[#c90024] text-sm font-raleway hover:underline"
        >
          View All Coupons
        </button>
      </div>
      
      {appliedCoupon ? (
        <div className="bg-green-50 p-3 rounded-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-green-700 font-medium font-raleway">{appliedCoupon}</p>
              <p className="text-green-600 text-sm font-raleway">Applied Successfully</p>
            </div>
            <div className="text-right">
              <p className="text-green-700 font-medium font-raleway">-₹{discountAmount.toFixed(2)}</p>
              <button
                onClick={onRemoveCoupon}
                className="text-red-600 text-sm font-raleway hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm font-raleway mb-2">No coupon applied</p>
          <button
            onClick={() => navigate('/coupons')}
            className="text-[#c90024] text-sm font-raleway hover:underline"
          >
            Browse Available Coupons
          </button>
        </div>
      )}
    </div>
  );
};

CouponCard.propTypes = {
  appliedCoupon: PropTypes.string,
  discountAmount: PropTypes.number,
  onRemoveCoupon: PropTypes.func.isRequired
};

export default CouponCard; 