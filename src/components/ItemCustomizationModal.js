import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * @typedef {import('../types').MenuItem} MenuItem
 * @typedef {import('../types').Variation} Variation
 * @typedef {import('../types').AddOnGroup} AddOnGroup
 * @typedef {import('../types').AddOnItem} AddOnItem
 */

const ItemCustomizationModal = ({ item, isOpen, onClose, onSubmit }) => {
  console.log('ItemCustomizationModal received item:', {
    id: item.id,
    name: item.name,
    variations: item.variations,
    hasVariations: Array.isArray(item.variations) && item.variations.length > 0,
    rawItem: item
  });

  const [selectedVariation, setSelectedVariation] = useState(
    /** @type {Variation|null} */ (Array.isArray(item.variations) && item.variations.length === 1 ? item.variations[0] : null)
  );
  const [selectedAddons, setSelectedAddons] = useState(/** @type {Array<AddOnItem & {quantity?: number}>} */ ([]));
  const [quantity, setQuantity] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Ensure variations is always an array
  const variations = Array.isArray(item.variations) ? item.variations : [];
  const addonGroups = Array.isArray(item.addon_groups) ? item.addon_groups : [];

  // Handle animation when modal opens/closes
  useEffect(() => {
    let timer;
    
    if (isOpen) {
      setIsVisible(true);
      // Small delay to ensure the element is in the DOM before animation starts
      timer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);
    } else {
      // Start the closing animation
      setIsAnimating(false);
      
      // Add a delay before hiding to allow animation to complete
      timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen]);

  const handleVariationSelect = (variation) => {
    setSelectedVariation(variation);
  };

  const handleAddonToggle = (addon, group) => {
    if (group.max_selection === 1) {
      // For single selection (radio), replace the existing addon in this group
      const otherGroupAddons = selectedAddons.filter(a => 
        !item.addon_groups?.find(g => g.id === group.id)?.items.some(i => i.id === a.id)
      );
      setSelectedAddons([...otherGroupAddons, { ...addon, quantity: 1 }]);
    } else {
      // For multiple selection (checkbox)
      const existingAddon = selectedAddons.find(a => a.id === addon.id);
      
      if (existingAddon) {
        // Remove addon if it exists
        setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
      } else {
        // Add addon if within group limits
        const groupAddons = selectedAddons.filter(a => 
          item.addon_groups?.find(g => g.id === group.id)?.items.some(i => i.id === a.id)
        );

        if (groupAddons.length < group.max_selection) {
          setSelectedAddons([...selectedAddons, { ...addon, quantity: 1 }]);
        }
      }
    }
  };

  const handleAddonQuantityChange = (addon, newQuantity) => {
    setSelectedAddons(selectedAddons.map(a => 
      a.id === addon.id ? { ...a, quantity: newQuantity } : a
    ));
  };

  const handleSubmit = () => {
    // Validate minimum add-on selections
    const isValid = item.addon_groups?.every(group => {
      const groupAddons = selectedAddons.filter(addon => 
        group.items.some(item => item.id === addon.id)
      );
      return groupAddons.length >= group.min_selection;
    });

    if (!isValid) {
      alert('Please select the minimum required add-ons for each group');
      return;
    }

    onSubmit({
      selectedVariation,
      selectedAddons,
      quantity
    });
  };

  if (!isVisible && !isOpen) return null;

  // Calculate base price (either variation price or item price)
  const basePrice = selectedVariation ? parseFloat(selectedVariation.price) : parseFloat(item.price);

  // Calculate add-ons total
  const addonsTotal = selectedAddons.reduce((sum, addon) => {
    const addonPrice = parseFloat(addon.price);
    const addonQuantity = parseInt(addon.quantity) || 1;
    return sum + (addonPrice * addonQuantity);
  }, 0);

  // Calculate total price: (base price + add-ons total) * quantity
  const totalPrice = (basePrice + addonsTotal) * quantity;

  return (
    <div 
      className={`fixed inset-0 bg-black transition-opacity duration-300 z-[100] ${isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'}`}
      onClick={onClose}
      style={{ display: isVisible ? 'block' : 'none' }}
    >
      <div 
        className={`fixed inset-x-0 bottom-0 bg-white rounded-t-xl w-full max-h-[90vh] overflow-hidden flex flex-col transition-transform duration-300 ease-in-out z-[101] ${isAnimating ? 'translate-y-0' : 'translate-y-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{item.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Variations Section */}
          {variations.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Select Variation</h3>
              <div className="space-y-2">
                {variations.map((variation) => (
                  <label
                    key={variation.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="variation"
                      checked={selectedVariation?.id === variation.id}
                      onChange={() => handleVariationSelect(variation)}
                      className="form-radio text-green-600"
                    />
                    <span className="flex-1">{variation.name}</span>
                    <span className="text-green-600">₹{parseFloat(variation.price).toFixed(2)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons Section */}
          {addonGroups.map((group) => (
            <div key={group.id} className="mb-6">
              <div className="flex justify-between mb-3">
                <h3 className="text-lg font-semibold">{group.name}</h3>
                <span className="text-sm text-gray-500">
                  {group.min_selection > 0 ? `Select ${group.min_selection}-${group.max_selection}` : `Optional (up to ${group.max_selection})`}
                </span>
              </div>
              <div className="space-y-2">
                {group.items.map((addon) => {
                  const isSelected = selectedAddons.some(a => a.id === addon.id);
                  const selectedAddon = selectedAddons.find(a => a.id === addon.id);

                  return (
                    <div
                      key={addon.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <label className="flex items-center flex-1 cursor-pointer">
                        <input
                          type={group.max_selection === 1 ? "radio" : "checkbox"}
                          name={`addon-group-${group.id}`}
                          checked={isSelected}
                          onChange={() => handleAddonToggle(addon, group)}
                          className="form-checkbox text-green-600 mr-3"
                        />
                        <div>
                          <div>{addon.name}</div>
                          <div className="text-sm text-green-600">₹{addon.price}</div>
                        </div>
                      </label>
                      
                      {isSelected && group.max_selection > 1 && (
                        <div className="flex items-center space-x-2">
                          <button
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                            onClick={() => handleAddonQuantityChange(addon, (selectedAddon?.quantity || 1) - 1)}
                            disabled={(selectedAddon?.quantity || 1) <= 1}
                          >
                            -
                          </button>
                          <span>{selectedAddon?.quantity || 1}</span>
                          <button
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                            onClick={() => handleAddonQuantityChange(addon, (selectedAddon?.quantity || 1) + 1)}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sticky Bottom Section */}
        <div className="border-t bg-white p-4 sticky bottom-0">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <button
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
            <div className="text-lg font-semibold">
              Total: ₹{totalPrice}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={variations.length > 0 && !selectedVariation}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold disabled:bg-gray-400"
          >
            Add to Cart - ₹{totalPrice}
          </button>
        </div>
      </div>
    </div>
  );
};

ItemCustomizationModal.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    variations: PropTypes.array,
    addon_groups: PropTypes.array
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default ItemCustomizationModal; 