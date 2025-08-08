import React from 'react';

const CartConflictDialog = ({ isOpen, onClose, onConfirm, conflictData }) => {
  if (!isOpen) return null;

  const { message, carts } = conflictData || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Cart Conflict</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        
        {carts && carts.length > 0 && (
          <div className="mb-4">
            <p className="font-medium mb-2">You have an active cart from a different restaurant.</p>
            <p className="text-sm text-gray-500 mb-4">
              To add items to this restaurant, you'll need to delete your existing cart first.
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Keep Existing Cart
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete Existing Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartConflictDialog; 