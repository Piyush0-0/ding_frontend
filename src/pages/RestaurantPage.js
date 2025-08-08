import React, { useState, useEffect, useRef, useMemo } from "react";
import { Helmet } from "react-helmet";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import MenuItemCard from "../components/MenuItemCard";
import FloatingMenu from "../components/FloatingMenu";
import CartPopup from "../components/CartPopup";
import ItemCustomizationModal from "../components/ItemCustomizationModal";
import AnimatedLogo from "../components/AnimatedLogo";
import WelcomePopup from "../components/WelcomePopup";
import apiClient from "../api/apiClient";
import { getSessionId } from "../utils/session";
import { useCart } from "../contexts/CartContext";
import { ChevronLeft, ShoppingCart, Menu as MenuIcon, X } from "react-feather";
import BlockingDialog from "../components/BlockingDialog";
import CartConflictDialog from '../components/CartConflictDialog';
import ItemImagePopup from '../components/ItemImagePopup';
import BottomNavBar from '../components/BottomNavBar';

/**
 * @typedef {import('../types').Restaurant} Restaurant
 * @typedef {import('../types').MenuItem} MenuItem
 * @typedef {import('../types').Category} Category
 * @typedef {import('../types').Cart} Cart
 * @typedef {import('../types').CartItem} CartItem
 */

const RestaurantPage = () => {
  const { restaurantId } = useParams();
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get("table");
  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { cart, cartTotals, minOrderAmount, updateCart, joinOrderGroup, orderGroup } = useCart();
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all"); // Default filter is "all"
  const navigate = useNavigate();
  const [closedRecommendations, setClosedRecommendations] = useState({});
  const [dialog, setDialog] = useState({ isOpen: false });
  const [cartConflict, setCartConflict] = useState(null);
  const [isConflictDialogOpen, setIsConflictDialogOpen] = useState(false);
  const [attemptedCartItem, setAttemptedCartItem] = useState(null);
  const [popupItem, setPopupItem] = useState(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  const sessionId = getSessionId();
  const categoryRefs = useRef({});

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setIsLoading(true);
        const categoryResponse = await apiClient.get(`/restaurants/${restaurantId}/categories`);
        const restaurantResponse = await apiClient.get(`/restaurants/${restaurantId}`);
        const itemsResponse = await apiClient.get(`/restaurants/${restaurantId}/items`);
        const reviewsResponse = await apiClient.get(`/restaurants/${restaurantId}/reviews`);
        
        setRestaurant(restaurantResponse.data.restaurant);
        setCategories(categoryResponse.data.categories);

        // Process reviews to extract ratings for each item
        const reviewsData = reviewsResponse.data.reviews || [];
        const itemReviews = {};

        reviewsData.forEach(review => {
          const itemId = review.item_id;
          if (!itemReviews[itemId]) {
            itemReviews[itemId] = {
              totalRating: 0,
              count: 0
            };
          }
          itemReviews[itemId].totalRating += review.rating;
          itemReviews[itemId].count += 1;
        });

        // Combine item data with review data
        const items = itemsResponse.data.items || [];
        const combined = items.map(item => {
          const reviewData = itemReviews[item.id] || { totalRating: 0, count: 0 };
          const averageRating = reviewData.count > 0 
            ? (reviewData.totalRating / reviewData.count).toFixed(1)
            : '0.0';
          
          return {
            ...item,
            averageRating: parseFloat(averageRating),
            reviewCount: reviewData.count
          };
        });
        setItems(combined);

        try {
          const restreviewsResponse = await apiClient.get(`/restaurants/${restaurantId}/restaurant-reviews`);
          const reviews = restreviewsResponse.data.reviews || [];
        
          const totalReviews = reviews.length;
          const averageRating = totalReviews > 0
            ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
            : 0;

            setRestaurant({
              ...restaurantResponse.data.restaurant,
              totalReviews,
              averageRating,
            });
        } catch (error) {
          console.error("Error fetching reviews:", error);
        }

        // Only fetch cart if we don't have one or if it's for a different restaurant
        // AND there's no table parameter (table param means we'll handle cart creation after group join)
        // Do NOT call updateCart here
      } catch (err) {
        console.error("Failed to fetch restaurant data:", err);
        setItems([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurantData();
  }, [restaurantId, sessionId]);

  // Auto-join-or-create group order for table if table param is present
  useEffect(() => {
    const autoJoinOrCreateGroupOrder = async () => {
      if (!tableParam || !restaurantId) return;
      try {
        const sessionId = getSessionId();
        const response = await apiClient.post("/order-groups/auto-join-or-create", {
          restaurant_id: restaurantId,
          table_id: tableParam,
          session_id: sessionId
        });
        if (response.data && response.data.success && response.data.data) {
          joinOrderGroup(response.data.data);
        }
      } catch (error) {
        handleOrderGroupError(error);
      }
    };
    autoJoinOrCreateGroupOrder();
  }, [restaurantId, tableParam]);

  useEffect(() => {
    const handleScroll = () => {
      const headers = document.querySelectorAll('.category-header');
      headers.forEach(headerContainer => {
        const header = headerContainer.querySelector('.sticky-header');
        if (!header) return;

        const rect = headerContainer.getBoundingClientRect();
        const isStuck = rect.top <= 136 && rect.bottom > 136;

        if (isStuck) {
          header.style.fontSize = '0.7rem';
          header.style.position = 'fixed';
          header.style.left = '1rem';
          header.style.top = '136px';
          header.style.backgroundColor = 'white';
          header.style.padding = '0.25rem 0';
          header.style.zIndex = '50';
          header.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        } else {
          header.style.fontSize = '0.875rem';
          header.style.position = 'static';
          header.style.backgroundColor = 'transparent';
          header.style.padding = '0';
          header.style.boxShadow = 'none';
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [categories]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter); // Update the active filter state
  };

  const handleItemClick = (item) => {
    // Check if item has any customizations
    const hasVariations = Array.isArray(item.variations) && item.variations.length > 0;
    const hasAddons = Array.isArray(item.addon_groups) && item.addon_groups.length > 0;
    
    if (hasVariations || hasAddons) {
      // Only show modal for items with customizations
      setSelectedItem(item);
      setIsCustomizationModalOpen(true);
    } else {
      // Directly add non-customizable items to cart
      addToCart({
        item_id: item.id,
        quantity: 1
      });
    }
  };

  const filteredItems = useMemo(() => {
    let filtered = items;

    // Apply search term filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply active filter
    if (activeFilter === "ratings") {
      filtered = filtered.filter((item) => item.averageRating >= 4.0); // Filter by ratings
    } else if (activeFilter === "bestseller") {
      filtered = filtered.filter((item) => item.is_bestseller); // Filter by bestseller
    }

    return filtered;
  }, [items, searchTerm, activeFilter]);

  const addToCart = async (cartItemData) => {
    try {
      const addItemRequest = {
        restaurant_id: restaurantId,
        session_id: sessionId,
        ...cartItemData
      };
      if (orderGroup) addItemRequest.order_group_id = orderGroup.id;
      const response = await apiClient.post("/cart/add-item", addItemRequest);
      // Update cart state with the new data
      if (response.data) {
        updateCart(
          response.data.cart,
          response.data.totals,
          response.data.minOrderAmount
        );
      }
    } catch (error) {
      console.log('addToCart error:', error);
      const errData = error?.response?.data || error;
      if (errData?.error === "cart_conflict") {
        setAttemptedCartItem(cartItemData); // Store the attempted item
        setCartConflict(errData);
        setIsConflictDialogOpen(true);
      } else {
        setDialog({
          isOpen: true,
          title: "Error",
          message: "Failed to add item to cart. Please try again.",
          actions: [
            { label: "Close", onClick: () => setDialog({ isOpen: false }) }
          ]
        });
      }
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const removeItemRequest = {
        restaurant_id: restaurantId,
        session_id: sessionId,
        cart_item_id: cartItemId
      };
      if (orderGroup) removeItemRequest.order_group_id = orderGroup.id;
      const response = await apiClient.post("/cart/remove-item", removeItemRequest);
      // Update cart state with the new data
      if (response.data) {
        updateCart(
          response.data.cart,
          response.data.totals,
          response.data.minOrderAmount
        );
      }
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
    }
  };

  const handleCustomizationSubmit = (customizationData) => {
    addToCart({
      item_id: selectedItem?.id,
      variation_id: customizationData.selectedVariation?.id,
      addon_items: customizationData.selectedAddons.map(addon => ({
        id: addon.id,
        quantity: addon.quantity || 1
      })),
      quantity: customizationData.quantity
    });
    setIsCustomizationModalOpen(false);
    setSelectedItem(null);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    const headerHeight = 100;
    if (categoryRefs.current[category]) {
      const elementPosition = categoryRefs.current[category].offsetTop;
      const adjustedPosition = elementPosition - headerHeight;
      window.scrollTo({
        top: adjustedPosition,
        behavior: "smooth",
      });
    }
    setMenuOpen(false);
  };

  const getRecommendations = (currentItem) => {
    // Filter out the current item
    const otherItems = items.filter(item => item.id !== currentItem.id);
    
    // Sort by bestsellers first, then by rating
    return otherItems
      .sort((a, b) => {
        if (a.is_bestseller && !b.is_bestseller) return -1;
        if (!a.is_bestseller && b.is_bestseller) return 1;
        return (b.averageRating || 0) - (a.averageRating || 0);
      })
      .slice(0, 5); // Get top 5 recommendations
  };

  const renderRecommendations = (item) => {
    if (closedRecommendations[item.id]) return null;
    const recommendations = getRecommendations(item);
    return (
      <div className="mt-4 mb-4 relative">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-gray-800 font-raleway">People usually pair this with</h3>
          <button
            className="absolute top-0 right-0 mt-1 mr-2 text-gray-400 hover:text-gray-700 p-1 rounded-full focus:outline-none"
            aria-label="Close recommendations"
            onClick={() => setClosedRecommendations(prev => ({ ...prev, [item.id]: true }))}
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex overflow-x-auto space-x-4 pb-2">
          {recommendations.map((recommendedItem) => {
            const cartItem = cart?.items?.find(item => item.item_id === recommendedItem.id);
            const quantity = cartItem?.quantity || 0;
            return (
              <div key={recommendedItem.id} className="flex-none w-80 bg-white rounded-2xl shadow-md p-3 flex flex-row items-stretch min-h-[7rem] relative">
                {/* Info Section */}
                <div className="flex flex-col flex-1 pr-2 justify-between">
                  <div>
                    {recommendedItem.is_bestseller && (
                      <div className="flex items-center mb-1">
                        <span className="text-xs text-[#fa4a5b] font-bold mr-1">★</span>
                        <span className="text-xs text-[#fa4a5b] font-semibold">Bestseller</span>
                      </div>
                    )}
                    <h4 className="text-sm font-bold text-gray-900 font-raleway mb-0.5 line-clamp-2">
                      {recommendedItem.name}
                    </h4>
                    <div className="flex items-center space-x-2 mt-0.5 mb-1">
                      <span className="text-base font-semibold text-gray-900">₹{recommendedItem.price}</span>
                      <span className="flex items-center text-sm text-green-700 font-bold">
                        <svg className="w-4 h-4 mr-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" /></svg>
                        {recommendedItem.averageRating}
                      </span>
                      <span className="text-xs text-gray-500">({recommendedItem.reviewCount})</span>
                    </div>
                    {recommendedItem.discount && (
                      <div className="flex items-center text-xs text-green-600 font-semibold mb-1">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 14l2-2 4 4m0 0l-4-4-2 2m6-6a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        50% OFF USE SWIGGYIT
                      </div>
                    )}
                  </div>
                </div>
                {/* Image & Add Button */}
                <div className="flex flex-col items-end justify-between relative w-28 min-w-[7rem] h-28 min-h-[7rem] -my-3 -mr-3 p-0">
                  {recommendedItem.image_url && (
                    <img
                      src={recommendedItem.image_url}
                      alt={recommendedItem.name}
                      className="w-full h-full rounded-tr-2xl rounded-br-2xl rounded-tl-none rounded-bl-none object-cover m-0 p-0"
                      loading="lazy"
                    />
                  )}
                  {quantity > 0 ? (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-2 w-20 h-7 flex items-center justify-between bg-white px-2 py-0 shadow-md rounded-lg border border-gray-200 z-10">
                      <button
                        className="px-2 py-0 bg-white text-[#c90024] font-bold rounded-md font-raleway text-xs h-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          cartItem && removeFromCart(cartItem.id);
                        }}
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-[#c90024] font-raleway select-none">{quantity}</span>
                      <button
                        className="px-2 py-0 bg-white text-[#c90024] font-bold rounded-md font-raleway text-xs h-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          const hasVariations = Array.isArray(recommendedItem.variations) && recommendedItem.variations.length > 0;
                          const hasAddons = Array.isArray(recommendedItem.addon_groups) && recommendedItem.addon_groups.length > 0;
                          if (hasVariations || hasAddons) {
                            handleItemClick(recommendedItem);
                          } else {
                            addToCart({ item_id: recommendedItem.id, quantity: 1 });
                          }
                        }}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      className="absolute bottom-2 right-2 w-8 h-8 bg-white border border-[#c90024] text-[#c90024] rounded-full flex items-center justify-center shadow-lg text-lg font-bold transition-colors duration-150 z-10 hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        const hasVariations = Array.isArray(recommendedItem.variations) && recommendedItem.variations.length > 0;
                        const hasAddons = Array.isArray(recommendedItem.addon_groups) && recommendedItem.addon_groups.length > 0;
                        if (hasVariations || hasAddons) {
                          handleItemClick(recommendedItem);
                        } else {
                          addToCart({ item_id: recommendedItem.id, quantity: 1 });
                        }
                      }}
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Helper to handle cart creation with dialog
  const createOrSwitchCart = async (cartRequest, restaurantName) => {
    try {
      const cartResponse = await apiClient.post("/cart", cartRequest);
      if (cartResponse.data) {
        updateCart(
          cartResponse.data.cart,
          cartResponse.data.totals,
          cartResponse.data.minOrderAmount
        );
      }
    } catch (err) {
      if (err.response && err.response.data?.error === "active_cart_exists") {
        const oldCart = err.response.data.cart;
        setDialog({
          isOpen: true,
          title: "Active Cart Exists",
          message: `You already have an active cart at ${oldCart.restaurant} with a total of ₹${oldCart.total}. Creating a new cart will delete your old cart. Do you want to proceed?`,
          actions: [
            {
              label: "Cancel",
              onClick: () => setDialog({ isOpen: false })
            },
            {
              label: "Proceed",
              style: "bg-[#c90024] text-white px-4 py-2 rounded-md font-raleway",
              onClick: async () => {
                setDialog({ isOpen: false });
                await createOrSwitchCart({ ...cartRequest, force: true }, restaurantName);
              }
            }
          ]
        });
      } else {
        // fallback error
        setDialog({
          isOpen: true,
          title: "Cart Error",
          message: err.response?.data?.error || "Failed to create cart. Please try again.",
          actions: [
            { label: "Close", onClick: () => setDialog({ isOpen: false }) }
          ]
        });
      }
    }
  };

  // Helper to handle order group errors
  const handleOrderGroupError = (err) => {
    if (err.response && err.response.data?.error === "active_ordergroup_exists") {
      const group = err.response.data.orderGroup;
      setDialog({
        isOpen: true,
        title: "Active Group Order Exists",
        message: `You are already part of an active group order at ${group.restaurant}. You can only be part of one group order at a time.`,
        actions: [
          {
            label: "Go to Group Order",
            style: "bg-[#c90024] text-white px-4 py-2 rounded-md font-raleway",
            onClick: () => {
              setDialog({ isOpen: false });
              navigate(`/order-group/${group.id}`);
            }
          }
        ]
      });
    } else {
      setDialog({
        isOpen: true,
        title: "Group Order Error",
        message: err.response?.data?.error || "Failed to join or create group order.",
        actions: [
          { label: "Close", onClick: () => setDialog({ isOpen: false }) }
        ]
      });
    }
  };

  const handleConflictResolution = async (shouldDelete) => {
    if (shouldDelete && cartConflict?.carts) {
      try {
        // Delete all conflicting carts
        for (const cart of cartConflict.carts) {
          await apiClient.delete(`/cart/${cart.id}`, {
            data: { session_id: sessionId }
          });
        }
        // Retry adding the item that caused the conflict
        if (attemptedCartItem) {
          await addToCart(attemptedCartItem);
          setAttemptedCartItem(null);
        } else {
          await fetchActiveCart();
        }
      } catch (error) {
        console.error("Error resolving cart conflict:", error);
        setDialog({
          isOpen: true,
          title: "Error",
          message: "Failed to resolve cart conflict. Please try again.",
          actions: [
            { label: "Close", onClick: () => setDialog({ isOpen: false }) }
          ]
        });
      }
    }
    setCartConflict(null);
    setIsConflictDialogOpen(false);
  };

  // Fetch the active cart for the current restaurant/group/session/user
  const fetchActiveCart = async () => {
    try {
      const cartRequest = {
        restaurant_id: restaurantId,
        session_id: sessionId
      };
      if (orderGroup) cartRequest.order_group_id = orderGroup.id;
      const cartResponse = await apiClient.post("/cart", cartRequest);

      if (cartResponse.data && cartResponse.data.cart) {
        // Only fetch items if we have a cart
        const cartItemsRequest = {
          restaurant_id: restaurantId,
          session_id: sessionId
        };
        if (orderGroup) cartItemsRequest.order_group_id = orderGroup.id;
        const cartItemsResponse = await apiClient.post("/cart/items", cartItemsRequest);
        const cartItems = cartItemsResponse.data?.cartItems || [];
        // Merge items into cart
        const updatedCart = {
          ...cartResponse.data.cart,
          items: cartItems
        };
        // Calculate totals
        const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
        const updatedTotals = {
          subtotal,
          total: subtotal,
          deliveryCharge: cartResponse.data.totals?.deliveryCharge || 0,
          packagingCharge: cartResponse.data.totals?.packagingCharge || 0
        };
        updatedTotals.total = updatedTotals.subtotal +
          updatedTotals.deliveryCharge +
          updatedTotals.packagingCharge;
        updateCart(updatedCart, updatedTotals, cartResponse.data.minOrderAmount);
      }
    } catch (err) {
      console.log('fetchActiveCart error:', err);
      const errData = err?.response?.data || err;
      if (errData?.error === "cart_conflict") {
        setCartConflict(errData);
        setIsConflictDialogOpen(true);
      } else {
        console.error("Failed to fetch active cart:", err);
      }
    }
  };

  // For /restaurant/1?table=1A
  useEffect(() => {
    if (tableParam && orderGroup && restaurantId) {
      fetchActiveCart();
    }
  }, [orderGroup, restaurantId, tableParam]);

  // For /restaurant/1
  useEffect(() => {
    if (restaurantId && sessionId && !tableParam) {
      fetchActiveCart();
    }
  }, [restaurantId, sessionId, tableParam]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <AnimatedLogo />
        <p className="mt-4 text-gray-600">Loading restaurant menu...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{restaurant ? `${restaurant.name} - Order Online | DING!` : 'Restaurant Menu | DING!'}</title>
        <meta name="description" content={restaurant ? `Order delicious food from ${restaurant.name}. Browse menu, check reviews, and get your favorite dishes delivered.` : 'Browse restaurant menus, order food online, and get delivery from your favorite restaurants.'} />
        <meta name="keywords" content={`${restaurant ? restaurant.name + ', ' : ''}food delivery, online ordering, restaurant menu, food ordering, delivery service`} />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicons/16X16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicons/32X32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/assets/favicons/96X96.png" />
      </Helmet>
      {showWelcomePopup && <WelcomePopup onClose={() => setShowWelcomePopup(false)} />}
      <div className="min-h-screen flex flex-col bg-gray-100">
        {restaurant && (
          <Header
            name={restaurant.name}
            address={restaurant.address}
            minOrderAmount={restaurant.minimum_order_amount}
            rating={restaurant.averageRating}
            reviewCount={restaurant.totalReviews}
          />
        )}

        {/* Search Bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for dishes..."
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="sticky top-[64px] z-30 bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 py-1 mb-2">
            <FilterBar
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
            />
          </div>
        </div>

        <div className="relative">
          <div className={`min-h-screen transition-all duration-300 ${menuOpen ? "blur-md" : ""}`}>
            <div className="space-y-0 pb-36">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto px-4 py-2">
                  {categories.map((category) => (
                    <div 
                      key={category.id} 
                      ref={el => categoryRefs.current[category.name] = el}
                      className="category-header mb-4"
                    >
                      <div className="sticky top-[118px] z-0 bg-gray-100 -mx-4 px-4 py-0.5 flex justify-start">
                        <h2 className="sticky-header text-sm font-extralight font-raleway transition-all duration-200">
                          {category.name}
                        </h2>
                      </div>
                      <div className="space-y-4 mt-2">
                        {filteredItems
                          .filter(item => item.category_id === category.id)
                          .map((item, index, array) => (
                            <React.Fragment key={item.id}>
                              <MenuItemCard
                                item={item}
                                cart={cart}
                                onItemClick={handleItemClick}
                                onRemoveFromCart={removeFromCart}
                                onImageClick={setPopupItem}
                              />
                              {cart?.items?.some(cartItem => cartItem.item_id === item.id) && 
                               index < array.length - 1 && 
                               renderRecommendations(item)}
                            </React.Fragment>
                          ))}
                      </div>
                    </div>
                  ))}
                  
                  {filteredItems.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 font-raleway">No items found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {isCustomizationModalOpen && selectedItem && (
          <ItemCustomizationModal
            item={selectedItem}
            isOpen={isCustomizationModalOpen}
            onClose={() => {
              setIsCustomizationModalOpen(false);
              setSelectedItem(null);
            }}
            onSubmit={handleCustomizationSubmit}
          />
        )}

        {!showWelcomePopup && (
          <FloatingMenu
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            isCartOpen={cart?.items?.length > 0}
          />
        )}

        {cart?.items?.length > 0 && (
          <CartPopup
            items={cart.items}
            total={cartTotals.total}
            onProceedToCheckout={() => navigate('/cart')}
          />
        )}
      </div>
      <BlockingDialog {...dialog} />
      <CartConflictDialog
        isOpen={isConflictDialogOpen}
        onClose={() => handleConflictResolution(false)}
        onConfirm={() => handleConflictResolution(true)}
        conflictData={cartConflict}
      />
      {popupItem && (
        <ItemImagePopup
          imageUrl={popupItem.image_url}
          itemName={popupItem.name}
          rating={popupItem.averageRating}
          description={popupItem.description}
          onClose={() => setPopupItem(null)}
        />
      )}
      <BottomNavBar />
    </>
  );
};

export default RestaurantPage;
