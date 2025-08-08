import React from 'react';
import { X } from 'react-feather';
import { useNavigate, useParams } from 'react-router-dom';

const WelcomePopup = ({ onClose }) => {
  const navigate = useNavigate();
  const { restaurantId } = useParams();

  const handleBookNow = () => {
    onClose();
    navigate(`/restaurant/${restaurantId}/events`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred background */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-[90%] max-w-[400px] flex flex-col items-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 z-0 bg-white bg-opacity-90 rounded-full p-1 shadow-lg hover:bg-gray-100 transition-colors"
          aria-label="Close popup"
        >
          <X size={20} className="text-gray-600" />
        </button>

        {/* Image container with 9:16 aspect ratio */}
        <div className="relative w-full rounded-2xl overflow-hidden z-10" style={{ height: '70vh', maxHeight: '600px' }}>
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=1422&fit=crop"
            alt="Welcome to DING!"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Book Now button */}
        <div className="mt-6 w-full z-10">
          <button
            onClick={handleBookNow}
            className="w-full bg-[#c90024] text-white py-3 rounded-xl font-bold text-lg hover:bg-[#a8001d] transition-colors duration-200 shadow-lg"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup; 