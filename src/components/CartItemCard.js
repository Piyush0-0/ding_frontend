import React from "react";
import PropTypes from 'prop-types';

/**
 * @typedef {import('../types').CartItem} CartItem
 */

/**
 * @param {Object} props
 * @param {CartItem} props.item
 * @param {(item: CartItem) => void} props.onAddToCart
 * @param {(cartItemId: number) => void} props.onRemoveFromCart
 * @param {string} props.className
 */
const CartItemCard = ({ item, onAddToCart, onRemoveFromCart, className = '' }) => {
  console.log('CartItemCard Render:', {
    itemId: item.id,
    itemName: item.item_name,
    addons: item.selected_addons,
    rawAddonItems: item.addon_items,
    price: item.price,
    unitPrice: item.unit_price,
    fullItem: item
  });

  // Use the stored price directly instead of recalculating
  const totalPrice = parseFloat(item.price);

  const handleAddToCart = () => {
    // Parse addon_items to get the original structure with quantities
    const parsedAddons = item.addon_items ? JSON.parse(item.addon_items) : [];
    
    onAddToCart({
      item_id: item.item_id,
      variation_id: item.variation_id || null,
      addon_items: parsedAddons,
      quantity: 1
    });
  };

  return (
    <div className={`flex flex-col py-1 px-4 ${className}`}>
      {/* Main Item Row */}
      <div className="flex items-center">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-xs font-medium text-gray-900 truncate font-raleway">{item.item_name}</h3>
        </div>
        <div className="flex items-center space-x-3 ml-auto">
          <div className="flex items-center bg-white border border-gray-300 rounded-md h-7">
            <button
              className="w-7 h-7 flex items-center justify-center text-[#c90024] hover:bg-gray-100 rounded-l-md text-xs"
              onClick={() => onRemoveFromCart(item.id)}
            >
              -
            </button>
            <span className="w-7 text-xs text-gray-900 text-center font-raleway">{item.quantity}</span>
            <button
              className="w-7 h-7 flex items-center justify-center text-[#c90024] hover:bg-gray-100 rounded-r-md text-xs"
              onClick={handleAddToCart}
            >
              +
            </button>
          </div>
          <div className="text-xs font-medium text-gray-900 min-w-[60px] text-right font-raleway">
            ₹{totalPrice.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Add-ons Section */}
      {item.selected_addons && item.selected_addons.length > 0 && (
        <div className="mt-0.5 ml-4">
          {item.selected_addons.map((addon, index) => (
            <div 
              key={`${addon.id}-${index}`}
              className="text-[10px] text-gray-500 flex items-center space-x-1 font-raleway"
            >
              <span>•</span>
              <span>
                {addon.quantity > 1 ? `${addon.quantity}x ` : ''}{addon.name}
                {' - '}₹{(addon.price * (addon.quantity || 1)).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Variation name if exists */}
      {item.variation_name && (
        <p className="text-[10px] text-gray-500 mt-0.5 ml-4 font-raleway">
          {item.variation_name}
        </p>
      )}
    </div>
  );
};

CartItemCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    item_id: PropTypes.number.isRequired,
    item_name: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    unit_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    quantity: PropTypes.number.isRequired,
    variation_id: PropTypes.number,
    variation_name: PropTypes.string,
    addon_items: PropTypes.string,
    selected_addons: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      quantity: PropTypes.number
    })),
    image_url: PropTypes.string
  }).isRequired,
  onAddToCart: PropTypes.func.isRequired,
  onRemoveFromCart: PropTypes.func.isRequired
};

export default CartItemCard;
