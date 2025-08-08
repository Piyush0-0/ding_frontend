import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'react-feather';

const AppBar = ({ title, showBack = true, backUrl }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
        {showBack && (
          <button
            onClick={handleBack}
            className="mr-4 p-2 -ml-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-lg font-semibold text-gray-900 font-raleway">{title}</h1>
      </div>
    </div>
  );
};

export default AppBar; 