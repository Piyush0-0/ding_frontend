import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { useCart } from '../contexts/CartContext';

/**
 * @typedef {import('../types').Cart} Cart
 */

const CartPopup = ({ items, total }) => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Add a small delay to trigger the animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!items || items.length === 0) {
    return null;
  }

  const handleCheckout = () => {
    navigate("/cart");
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600 font-raleway">
              {items.reduce((sum, item) => sum + item.quantity, 0)} items
            </p>
            <p className="text-lg font-semibold text-gray-900 font-raleway">
              Total: ₹{total.toFixed(2)}
            </p>
          </div>
          <button
            onClick={handleCheckout}
            className="bg-[#c90024] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#a8001d] transition-colors font-raleway"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

CartPopup.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    quantity: PropTypes.number.isRequired,
    item: PropTypes.object.isRequired,
    selected_variation: PropTypes.object,
    selected_addons: PropTypes.array
  })).isRequired,
  total: PropTypes.number.isRequired
};

export default CartPopup;
