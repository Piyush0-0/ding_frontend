import React, { useState, useEffect } from 'react';
import { Plus } from 'react-feather';
import apiClient from '../api/apiClient';

const CompleteYourMeal = ({ onAddToCart, restaurantId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!restaurantId) return;
    const fetchItems = async () => {
      setLoading(true);
      try {
        const itemsRes = await apiClient.get(`/restaurants/${restaurantId}/items`);
        setItems(itemsRes.data.items || []);
      } catch (error) {
        console.error('Failed to fetch items for Complete Your Meal:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [restaurantId]);

  return (
    <div className="bg-white rounded-2xl p-4 mb-4">
      <div className="uppercase text-[10px] font-bold tracking-widest text-gray-400 mb-2 font-raleway">Complete your meal</div>
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {loading ? (
          <div className="text-xs text-gray-400 font-raleway">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-xs text-gray-400 font-raleway">No items available.</div>
        ) : items.map(item => (
          <div key={item.id} className="flex-shrink-0 w-24">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden mb-1 bg-gray-100">
              <img
                src={item.image_url || '/images/placeholder.png'}
                alt={item.name}
                className="object-cover w-full h-full" />
              <button
                onClick={() => onAddToCart({ item_id: item.id, quantity: 1 })}
                className="absolute top-1 right-1 bg-white rounded-lg border border-gray-200 p-1 shadow hover:bg-gray-50"
              >
                <Plus size={14} className="text-[#c90024]" />
              </button>
            </div>
            <div className="text-[11px] font-raleway font-medium text-gray-900 truncate mb-1">{item.name}</div>
            <div className="text-xs font-semibold font-raleway text-gray-700">₹{item.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompleteYourMeal; 