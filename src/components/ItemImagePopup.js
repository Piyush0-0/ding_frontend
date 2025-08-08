import React from "react";
import { X, Star } from "react-feather";

const ItemImagePopup = ({ imageUrl, onClose, itemName, rating, description }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Blurred background */}
      <div
        className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />
      {/* Popup */}
      <div className="relative w-full max-w-md bg-white rounded-t-2xl shadow-lg p-0 animate-slideUp h-[70vh] flex flex-col items-stretch overflow-hidden">
        {/* X Icon */}
        <button
          className="absolute top-4 right-4 z-20 bg-white bg-opacity-90 rounded-full p-1.5 shadow-md border border-gray-200 hover:bg-[#c90024] hover:text-white transition-colors"
          onClick={onClose}
          aria-label="Close"
          style={{ backdropFilter: 'blur(2px)' }}
        >
          <X size={16} />
        </button>
        {/* Image fills top 50% */}
        <div className="flex-shrink-0 w-full h-1/2 flex items-center justify-center bg-gray-50 overflow-hidden">
          <img
            src={imageUrl}
            alt={itemName}
            className="object-cover w-full h-full"
          />
        </div>
        {/* Details fill bottom 50% */}
        <div className="flex-1 flex flex-col px-6 pt-5 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg font-bold font-raleway line-clamp-1 flex-1">{itemName}</span>
            {typeof rating !== 'undefined' && (
              <span className="flex items-center gap-1 text-sm font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                <Star size={16} className="text-green-500" fill="#22c55e" />
                {rating}
              </span>
            )}
          </div>
          {description && (
            <div className="text-sm text-gray-700 font-raleway mt-1 line-clamp-5">{description}</div>
          )}
        </div>
        <style jsx>{`
          .animate-slideUp {
            animation: slideUp 0.3s cubic-bezier(0.4,0,0.2,1);
          }
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ItemImagePopup; 