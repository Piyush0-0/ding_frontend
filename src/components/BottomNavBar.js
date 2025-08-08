import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Calendar, MessageSquare } from 'react-feather';

const BottomNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="max-w-3xl mx-auto flex justify-around items-center">
        {/* Profile Icon */}
        <button
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center p-2 ${
            isActive('/profile') ? 'text-[#c90024]' : 'text-gray-600'
          }`}
        >
          <User size={24} />
          <span className="text-xs mt-1">Profile</span>
        </button>

        {/* Events Icon */}
        <button
          onClick={() => {
            const restaurantId = location.pathname.split('/')[2];
            if (restaurantId) {
              navigate(`/restaurant/${restaurantId}/events`);
            }
          }}
          className={`flex flex-col items-center p-2 ${
            isActive('/events') ? 'text-[#c90024]' : 'text-gray-600'
          }`}
        >
          <Calendar size={24} />
          <span className="text-xs mt-1">Events</span>
        </button>

        {/* AI Chat Icon */}
        <button
          onClick={() => navigate('/chat')}
          className={`flex flex-col items-center p-2 ${
            isActive('/chat') ? 'text-[#c90024]' : 'text-gray-600'
          }`}
        >
          <MessageSquare size={24} />
          <span className="text-xs mt-1">AI Chat</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNavBar; 