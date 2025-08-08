import React from 'react';
import PropTypes from 'prop-types';

/**
 * @typedef {import('../types').MenuItem} MenuItem
 * @typedef {import('../types').Cart} Cart
 */

const MenuItemCard = ({ item, cart, onItemClick, onRemoveFromCart, onImageClick }) => {
  // Find all cart items that match this item (including variations and addons)
  const cartItems = cart?.items?.filter(
    (cartItem) => cartItem.item_id === item.id
  );

  // Calculate total quantity for this item
  const quantity = cartItems?.reduce((sum, cartItem) => sum + cartItem.quantity, 0) || 0;

  // Safely check for variations and addon_groups
  const variations = Array.isArray(item.variations) ? item.variations : [];
  const addonGroups = Array.isArray(item.addon_groups) ? item.addon_groups : [];
  
  const hasCustomizations = variations.length > 0 || addonGroups.length > 0;

  // Get the lowest price among all variations, or use the base price
  const minPrice = variations.length > 0
    ? Math.min(...variations.map(v => v.price), item.price)
    : item.price;

  // Fallback for averageRating and reviewCount
  const displayRating = isNaN(item.averageRating) || item.averageRating == null ? 0 : item.averageRating;
  const displayReviewCount = item.reviewCount == null ? 0 : item.reviewCount;

  return (
    <div className="flex items-center justify-between p-4 bg-white shadow rounded-lg">
      {/* Left Section: Item Details */}
      <div className="flex-1 pr-6">
        <div className="flex items-center">
          <h3 className="text-base font-semibold font-raleway">{item.name}</h3>
          {hasCustomizations && (
            <span className="ml-2 text-xs text-gray-500 font-raleway">(Customizable)</span>
          )}
        </div>
        <p className="text-sm font-medium text-black font-raleway">
          {variations.length > 0 ? `From ₹${minPrice}` : `₹${minPrice}`}
        </p>
        <div className="flex items-center text-sm text-gray-500">
          <span className="flex items-center text-green-700 font-bold mr-1">
            <svg className="w-4 h-4 mr-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" /></svg>
            {displayRating}
          </span>
          <span className="text-xs text-gray-500">({item.reviewCount})</span>
        </div>
        <p className="text-xs text-gray-500 mt-1 font-raleway">{item.description}</p>
      </div>

      {/* Right Section: Image + Add/Remove Buttons */}
      <div className="relative flex flex-col items-center">
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-32 h-32 rounded-lg object-cover cursor-pointer"
            loading="lazy"
            onClick={e => {
              e.stopPropagation();
              if (onImageClick) onImageClick(item);
            }}
          />
        )}

        {/* Add to Cart / Quantity Buttons */}
        <div className="absolute bottom-[-12px] w-28">
          {quantity > 0 ? (
            <div className="flex items-center justify-between bg-white px-4 py-1 shadow-md rounded-lg border border-gray-200 w-full">
              <button
                className="px-3 py-1 bg-white text-[#c90024] font-bold rounded-md font-raleway"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFromCart(cartItems[0].id);
                }}
              >
                -
              </button>
              <span className="text-sm font-bold text-[#c90024] font-raleway">
                {quantity}
              </span>
              <button
                className="px-3 py-1 bg-white text-[#c90024] font-bold rounded-md font-raleway"
                onClick={(e) => {
                  e.stopPropagation();
                  onItemClick(item);
                }}
              >
                +
              </button>
            </div>
          ) : (
            <button
              className="w-full flex items-center justify-center px-6 py-2 bg-white text-[#c90024] text-sm font-semibold rounded-lg shadow-md border border-[#c90024] font-raleway"
              onClick={(e) => {
                e.stopPropagation();
                onItemClick(item);
              }}
            >
              {hasCustomizations ? 'CUSTOMIZE' : 'ADD'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

MenuItemCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    image_url: PropTypes.string,
    variations: PropTypes.array,
    addon_groups: PropTypes.array
  }).isRequired,
  cart: PropTypes.shape({
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      item_id: PropTypes.number.isRequired,
      quantity: PropTypes.number.isRequired,
      selected_variation: PropTypes.object,
      selected_addons: PropTypes.array
    }))
  }),
  onItemClick: PropTypes.func.isRequired,
  onRemoveFromCart: PropTypes.func.isRequired,
  onImageClick: PropTypes.func,
};

export default MenuItemCard;
