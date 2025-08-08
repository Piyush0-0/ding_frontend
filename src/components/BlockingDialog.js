import React from "react";

const BlockingDialog = ({ isOpen, title, message, details, actions = [], onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md shadow-lg w-96 max-w-full">
        {title && <h2 className="text-lg font-bold mb-4 font-raleway">{title}</h2>}
        <div className="mb-4 text-gray-800 font-raleway">{message}</div>
        {details && (
          <div className="mb-4 text-sm text-gray-600 font-raleway">
            {typeof details === 'string' ? details : (
              <ul>
                {Object.entries(details).map(([key, value]) => (
                  <li key={key}><span className="font-semibold capitalize">{key}:</span> {value}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        <div className="flex justify-end space-x-2 mt-6">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className={
                action.style ||
                "px-4 py-2 rounded-md font-raleway bg-gray-200 text-gray-800 hover:bg-gray-300"
              }
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlockingDialog; 