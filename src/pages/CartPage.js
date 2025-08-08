import React, { useState, useEffect } from "react";
import CartItemCard from "../components/CartItemCard";
import LoginModal from "../components/LoginModal";
import { getSessionId } from "../utils/session";
import apiClient from "../api/apiClient";
import AppBar from "../components/AppBar";
import ExpectedOrderTime from "../components/ExpectedOrderTime";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import CouponCard from "../components/CouponCard";
import { CheckCircle, Edit, X, ChevronDown, ChevronUp } from "react-feather";
import OrderSuccessSplash from "../components/OrderSuccessSplash";
import { Helmet } from "react-helmet";
import CompleteYourMeal from "../components/CompleteYourMeal";

/**
 * @typedef {import('../types').Restaurant} Restaurant
 * @typedef {import('../types').Cart} Cart
 * @typedef {import('../types').CartItem} CartItem
 */

const CartPage = () => {
  const sessionId = getSessionId();
  const { cart, cartTotals, minOrderAmount, updateCart, orderGroup, joinOrderGroup } = useCart();
  const [restaurant, setRestaurant] = useState(/** @type {Restaurant|null} */ (null));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [orderType, setOrderType] = useState(null); // 'PAY_AND_PLACE' or 'PAY_AT_END'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [appliedCoupon, setAppliedCoupon] = useState(localStorage.getItem('selectedCoupon'));
  const [showSuccessSplash, setShowSuccessSplash] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [showCookingInstructions, setShowCookingInstructions] = useState(false);
  const [cookingInstructionsInput, setCookingInstructionsInput] = useState("");
  const [cookingInstruction, setCookingInstruction] = useState("");
  const [showCoupons, setShowCoupons] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([
    { code: 'SAVE10', description: 'Save 10% on your order' },
    { code: 'FREEDRINK', description: 'Get a free drink with your meal' },
    { code: 'WELCOME', description: 'Welcome offer: 15% off' },
  ]);
  const [showBillDetails, setShowBillDetails] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      console.log("Fetching cart...", { sessionId });
      try {
        // Fetch cart data without requiring restaurant_id
        const cartResponse = await apiClient.post("/cart", {
          session_id: sessionId
          // No restaurant_id needed now - API will return the active cart
        });

        console.log("Cart API Response:", {
          cart: cartResponse.data.cart,
          items: cartResponse.data.cart?.items,
          firstItem: cartResponse.data.cart?.items?.[0],
          addons: cartResponse.data.cart?.items?.[0]?.selected_addons,
          totals: cartResponse.data.totals
        });

        // If cart exists and has a restaurant_id, fetch restaurant details
        if (cartResponse.data?.cart?.restaurant_id) {
          const restaurantResponse = await apiClient.get(
            `/restaurants/${cartResponse.data.cart.restaurant_id}`
          );
          setRestaurant(restaurantResponse.data.restaurant);
          
          // Set order type based on restaurant configuration
          setOrderType(restaurantResponse.data.restaurant.payment_acceptance_type || 'PAY_AND_PLACE');
          
          // Now that we have restaurant_id, fetch cart items
          try {
            const cartItemsRequest = {
              session_id: sessionId,
              restaurant_id: cartResponse.data.cart.restaurant_id
            };
            if (cartResponse.data.cart.order_group_id) {
              cartItemsRequest.order_group_id = cartResponse.data.cart.order_group_id;
            }
            const cartItemsResponse = await apiClient.post("/cart/items", cartItemsRequest);
            
            if (cartItemsResponse.data && cartItemsResponse.data.cartItems) {
              // Update cart with items
              const updatedCart = {
                ...cartResponse.data.cart,
                items: cartItemsResponse.data.cartItems
              };
              
              // Calculate totals from items (fallback if backend doesn't provide enhanced totals)
              const subtotal = cartItemsResponse.data.cartItems.reduce((sum, item) => {
                return sum + (parseFloat(item.price) || 0);
              }, 0);
              
              // Use enhanced totals from backend if available, otherwise fallback to simple calculation
              const updatedTotals = cartResponse.data.totals || {
                subtotal: subtotal,
                total: subtotal,
                deliveryCharge: 0,
                packagingCharge: 0,
                taxAmount: 0,
                breakdown: {
                  itemTotal: subtotal,
                  deliveryCharge: 0,
                  packagingCharge: 0,
                  taxAmount: 0
                }
              };
              
              // Update cart with items and recalculated totals
              updateCart(
                updatedCart,
                updatedTotals,
                cartResponse.data.minOrderAmount
              );
            }
          } catch (itemsError) {
            console.error("Failed to fetch cart items:", itemsError);
          }
        }

        // If cart is associated with an order group, fetch group status and set orderGroup context
        if (cartResponse.data?.cart?.order_group_id) {
          try {
            const groupStatusResp = await apiClient.get(`/order-groups/${cartResponse.data.cart.order_group_id}/status`);
            if (groupStatusResp.data && groupStatusResp.data.success && groupStatusResp.data.data) {
              joinOrderGroup(groupStatusResp.data.data);
            }
          } catch (groupErr) {
            console.error("Failed to fetch group order status:", groupErr);
          }
        }

        // Update cart state using context (this will be overwritten if we successfully fetched items above)
        if (cartResponse.data && !cartResponse.data.cart?.restaurant_id) {
          console.log("Updating cart with empty cart data");
          updateCart(
            cartResponse.data.cart,
            cartResponse.data.totals,
            cartResponse.data.minOrderAmount
          );
        }

        // Check if user is logged in
        setIsLoggedIn(cartResponse.data.isLoggedIn);
      } catch (error) {
        console.error("Failed to fetch cart:", error);
        setError("Failed to load cart. Please try again.");
      }
    };

    if (sessionId) {
      fetchCart();
    }
  }, [sessionId]);

  const handleProceedToPayment = async () => {
    if (!cart?.items?.length) {
      setError("Your cart is empty");
      return;
    }

    if (cartTotals.total < (restaurant?.minimum_order_amount || 0)) {
      setError(`Minimum order amount is ₹${restaurant?.minimum_order_amount || 0}`);
      return;
    }

    setIsLoading(true);
    setError(null); // Clear any previous errors
    
    try {
      let orderData = {
        session_id: sessionId,
        // Order type is now stored in cart, no need to pass it
      };

      // Add order group if available
      if (orderGroup?.id) {
        orderData.order_group_id = orderGroup.id;
      }

      console.log('Creating order with data:', orderData);
      const response = await apiClient.post("/orders/create", orderData);
      
      console.log('Order creation response:', response.data);
      
      if (response.data?.success) {
        // Fix: Use the correct response structure (orderId instead of order.id)
        const orderId = response.data.data.orderId;
        console.log('Order created successfully with ID:', orderId);
        
        // If order belongs to a group, redirect to group page
        if (orderGroup?.id) {
          navigate(`/order-group/${orderGroup.id}`);
        } else {
          // Individual order - use normal flow
          if (orderType === 'PAY_AND_PLACE') {
            navigate(`/payments/${orderId}`);
          } else {
            navigate(`/orders/${orderId}`);
          }
        }
      } else {
        throw new Error(response.data?.error || "Failed to create order");
      }
    } catch (error) {
      console.error("Failed to create order:", error);
      
      // Provide specific error messages to the user
      let errorMessage = "Failed to create order. Please try again.";
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show specific POS-related errors to help user understand what happened
      if (errorMessage.includes("POS")) {
        errorMessage = "Unable to sync with restaurant system. Please try again or contact the restaurant directly.";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSplashComplete = () => {
    setShowSuccessSplash(false);
    if (orderGroup && orderGroup.id) {
      navigate(`/order-group/${orderGroup.id}`);
    } else if (orderId) {
      navigate(`/orders/${orderId}`);
    }
  };

  // Handle order type change - create new cart with new order type
  const handleOrderTypeChange = async (newOrderType) => {
    try {
      // Create/get cart with new order type
      const cartResponse = await apiClient.post("/cart", {
        session_id: sessionId,
        restaurant_id: restaurant?.id,
        order_type: newOrderType,
        force: true // Force creation with new order type
      });

      if (cartResponse.data) {
        updateCart(
          cartResponse.data.cart,
          cartResponse.data.totals,
          cartResponse.data.minOrderAmount
        );
        setOrderType(newOrderType);
      }
    } catch (error) {
      console.error("Failed to change order type:", error);
      setError("Failed to change order type");
    }
  };

  const addToCart = async (cartItemData) => {
    try {
      const addItemRequest = {
        session_id: sessionId,
        restaurant_id: restaurant?.id,
        order_type: orderType, // Pass current order type
        ...cartItemData
      };
      if (orderGroup) addItemRequest.order_group_id = orderGroup.id;
      const response = await apiClient.post("/cart/add-item", addItemRequest);
      
      if (response.data) {
        updateCart(
          response.data.cart,
          response.data.totals,
          response.data.minOrderAmount
        );
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const removeItemRequest = {
        session_id: sessionId,
        restaurant_id: restaurant?.id,
        cart_item_id: cartItemId
      };
      if (orderGroup) removeItemRequest.order_group_id = orderGroup.id;
      const response = await apiClient.post("/cart/remove-item", removeItemRequest);
      
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

  const handleLoginSuccess = async (phoneNumber) => {
    setIsLoggedIn(true);
    // After successful login, proceed with order placement
    await handleProceedToPayment();
  };

  const handleApplyCoupon = async (couponCode) => {
    try {
      const couponRequest = {
        session_id: sessionId,
        restaurant_id: restaurant?.id,
        coupon_code: couponCode
      };
      if (orderGroup) couponRequest.order_group_id = orderGroup.id;
      const response = await apiClient.post("/cart/apply-coupon", couponRequest);
      
      if (response.data) {
        updateCart(
          response.data.cart,
          response.data.totals,
          response.data.minOrderAmount
        );
        setAppliedCoupon(couponCode);
        localStorage.setItem('selectedCoupon', couponCode);
      }
    } catch (error) {
      console.error("Failed to apply coupon:", error);
      setError("Invalid or expired coupon code");
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      const couponRequest = {
        session_id: sessionId,
        restaurant_id: restaurant?.id
      };
      if (orderGroup) couponRequest.order_group_id = orderGroup.id;
      const response = await apiClient.post("/cart/remove-coupon", couponRequest);
      
      if (response.data) {
        updateCart(
          response.data.cart,
          response.data.totals,
          response.data.minOrderAmount
        );
        setAppliedCoupon(null);
        localStorage.removeItem('selectedCoupon');
      }
    } catch (error) {
      console.error("Failed to remove coupon:", error);
      setError("Failed to remove coupon. Please try again.");
    }
  };

const saveCookingInstructions = async (instructionText) => {
  try {
    const instructionsRequest = {
      session_id: sessionId,
      restaurant_id: restaurant?.id,
      cooking_instructions: instructionText
    };
    if (orderGroup) instructionsRequest.order_group_id = orderGroup.id;
    const response = await apiClient.post("/cart/set-instructions", instructionsRequest);

    if (response.data?.message === "Instructions saved") {
      // success - no further action required
    }
  } catch (error) {
    console.error("Failed to save cooking instructions:", error);
    setError("Failed to save cooking instructions");
  }
};


  // Calculate cart totals - now using server-provided breakdown
  const totals = cartTotals || { 
    subtotal: 0, 
    total: 0, 
    deliveryCharge: 0, 
    packagingCharge: 0, 
    taxAmount: 0,
    breakdown: {
      itemTotal: 0,
      deliveryCharge: 0,
      packagingCharge: 0,
      taxAmount: 0
    }
  };

  console.log("Rendering CartPage with:", { cart, totals, cartTotals, orderType });

  return (
    <>
      <Helmet>
        <title>Cart | DING! - Order food at your table</title>
        <meta name="description" content="Review your cart items, apply coupons, and place your order." />
        <meta name="keywords" content="cart, food order, restaurant menu, checkout" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicons/16X16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicons/32X32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/assets/favicons/96X96.png" />
      </Helmet>
      <div className="min-h-screen flex flex-col bg-gray-100">
        <AppBar title="Cart" showBack={true} />
        <div className="flex-1 p-4 pb-24 max-w-3xl mx-auto w-full mt-14">
          {showSuccessSplash && <OrderSuccessSplash onComplete={handleSplashComplete} />}
          {cart?.items?.length > 0 ? (
            <>
              {restaurant && (
                <div className="bg-white rounded-2xl shadow p-4 mb-4 flex flex-col gap-2">
                  <label className="text-xs font-semibold font-raleway mb-1">Order Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="orderType"
                        value="DINE_IN"
                        checked={orderType === 'DINE_IN'}
                        onChange={() => handleOrderTypeChange('DINE_IN')}
                      />
                      <span className="text-xs font-raleway">Dine-in</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="orderType"
                        value="PICKUP"
                        checked={orderType === 'PICKUP'}
                        onChange={() => handleOrderTypeChange('PICKUP')}
                      />
                      <span className="text-xs font-raleway">Pickup</span>
                    </label>
                  </div>
                  <div className="mt-1">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-raleway font-semibold bg-gray-100 text-gray-700">
                      {orderType === 'PICKUP' ? 'Pickup: Collect your order at the counter' : 'Dine-in: Food will be served at your table'}
                    </span>
                  </div>
                </div>
              )}
              <div className="bg-white rounded-2xl shadow mb-4 overflow-hidden">
                <div className="p-4 pb-0">
                  <ExpectedOrderTime items={cart.items} />
                </div>
                {cart.items.map((item, idx) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onAddToCart={addToCart}
                    onRemoveFromCart={removeFromCart}
                    className={idx === 0 ? 'mt-3' : ''}
                  />
                ))}
                <div className="p-4 flex gap-2">
                  <button
                    onClick={() => {
                      let url = `/restaurant/${restaurant?.id}`;
                      if (orderGroup && orderGroup.table_number) {
                        url += `?table=${orderGroup.table_number}`;
                      }
                      navigate(url);
                    }}
                    className="flex items-center gap-2 border border-gray-300 rounded-lg px-2 py-1 text-xs font-raleway text-[#c90024] hover:text-[#a8001d] bg-white hover:bg-gray-50 transition"
                  >
                    + Add Items
                  </button>
                  <button
                    className="flex items-center gap-1 border border-gray-300 rounded-lg px-2 py-1 text-xs font-raleway text-gray-700 hover:text-[#c90024] bg-white hover:bg-gray-50 transition"
                    onClick={e => {
                      if (!cookingInstruction) setShowCookingInstructions((v) => !v);
                    }}
                    type="button"
                  >
                    <Edit size={14} />
                    Cooking Instructions
                    {Boolean(cookingInstruction) && (
                      <span
                        className="ml-2 flex items-center"
                        onClick={e => {
                          e.stopPropagation();
                          setCookingInstruction("");
                          setCookingInstructionsInput("");
                          setShowCookingInstructions(false);
                        }}
                        role="button"
                        tabIndex={0}
                        style={{ cursor: 'pointer' }}
                        aria-label="Delete cooking instruction"
                      >
                        <X size={14} className="text-gray-400 hover:text-[#c90024]" />
                      </span>
                    )}
                  </button>
                </div>
                {showCookingInstructions && !cookingInstruction && (
                  <div className="px-4 pb-2">
                    <div className="relative w-full">
                      <Edit size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg py-1.5 pl-8 pr-16 text-xs font-raleway focus:border-[#c90024] focus:ring-0 placeholder-gray-400"
                        placeholder="Type cooking instructions"
                        value={cookingInstructionsInput}
                        onChange={e => setCookingInstructionsInput(e.target.value)}
                      />
                      {cookingInstructionsInput && (
                        <button
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-raleway text-[#c90024] hover:underline hover:text-[#a8001d] bg-transparent border-0 shadow-none p-0 m-0 cursor-pointer"
                          onClick={() => {
                            setCookingInstruction(cookingInstructionsInput);
                            setShowCookingInstructions(false);
                          }}
                        >
                          Save
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <CompleteYourMeal onAddToCart={addToCart} restaurantId={restaurant?.id} />
              <div className="bg-white rounded-2xl shadow p-4 mb-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-semibold font-raleway">Apply Coupon</h2>
                  {appliedCoupon ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-500" size={16} />
                      <span className="text-green-500 text-xs font-raleway">{appliedCoupon}</span>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-red-500 text-xs font-raleway hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCoupons((v) => !v)}
                      className="text-[#c90024] text-xs font-raleway hover:text-[#a8001d]"
                    >
                      View Coupons
                    </button>
                  )}
                </div>
                {showCoupons && !appliedCoupon && (
                  <div className="mt-3 space-y-2">
                    {availableCoupons.map(coupon => (
                      <button
                        key={coupon.code}
                        onClick={() => {
                          setAppliedCoupon(coupon.code);
                          setShowCoupons(false);
                        }}
                        className="block w-full text-left px-3 py-2 rounded bg-gray-50 hover:bg-[#ffeaea] text-xs font-raleway border border-gray-200"
                      >
                        <span className="font-semibold text-[#c90024]">{coupon.code}</span> - {coupon.description}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm p-4">
                <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setShowBillDetails(v => !v)}>
                  <span className="text-xs font-semibold font-raleway">Pay</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold font-raleway">₹{totals.total.toFixed(2)}</span>
                    {showBillDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
                {showBillDetails && (
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between text-gray-600 text-xs">
                      <span className="font-raleway">Item Total</span>
                      <span className="font-raleway">₹{totals.subtotal.toFixed(2)}</span>
                    </div>
                    
                    {/* Service Charge */}
                    {totals.serviceCharge > 0 && (
                      <div className="flex justify-between text-gray-600 text-xs">
                        <span className="font-raleway">Service Charge</span>
                        <span className="font-raleway">₹{totals.serviceCharge.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {/* Delivery Charge */}
                    {totals.deliveryCharge > 0 && (
                      <div className="flex justify-between text-gray-600 text-xs">
                        <span className="font-raleway">Delivery Charge</span>
                        <span className="font-raleway">₹{totals.deliveryCharge.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {/* Packaging Charge */}
                    {totals.packagingCharge > 0 && (
                      <div className="flex justify-between text-gray-600 text-xs">
                        <span className="font-raleway">Packaging Charge</span>
                        <span className="font-raleway">₹{totals.packagingCharge.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {/* Coupon Discount */}
                    {appliedCoupon && (
                      <div className="flex justify-between text-green-600 text-xs">
                        <span className="font-raleway">Coupon Discount</span>
                        <span className="font-raleway">-₹{(cartTotals.subtotal - cartTotals.total).toFixed(2)}</span>
                      </div>
                    )}
                    
                    {/* Tax Amount */}
                    <div className="flex justify-between text-gray-600 text-xs">
                      <span className="font-raleway">GST (5%)</span>
                      <span className="font-raleway">₹{totals.taxAmount.toFixed(2)}</span>
                    </div>
                    
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold text-gray-900 text-xs">
                        <span className="font-raleway">Total</span>
                        <span className="font-raleway">₹{totals.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 font-raleway">Your cart is empty</p>
            </div>
          )}
        </div>

        {cart?.items?.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
            <div className="max-w-3xl mx-auto w-full">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2 font-raleway">
                  {error}
                </div>
              )}
              
              {!isLoggedIn ? (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="w-full bg-[#c90024] text-white py-2 px-3 rounded-md font-medium font-raleway text-xs hover:bg-[#a8001d] transition-colors"
                >
                  Login to Proceed
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      let url = `/restaurant/${restaurant?.id}`;
                      if (orderGroup && orderGroup.table_number) {
                        url += `?table=${orderGroup.table_number}`;
                      }
                      navigate(url);
                    }}
                    className="flex-1 border-2 border-[#c90024] text-[#c90024] py-2 px-3 rounded-md text-sm font-medium hover:bg-[#c90024] hover:text-white transition-colors font-raleway"
                  >
                    Add More Items
                  </button>
                  <button
                    onClick={handleProceedToPayment}
                    disabled={totals.total < (restaurant?.minimum_order_amount || 0) || isLoading}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium font-raleway ${
                      totals.total >= (restaurant?.minimum_order_amount || 0) && !isLoading
                        ? "bg-[#c90024] text-white hover:bg-[#a8001d] transition-colors"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      orderType === 'PAY_AND_PLACE' 
                        ? `Pay ₹${totals.total.toFixed(2)}` 
                        : `Place Order (₹${totals.total.toFixed(2)})`
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
};

export default CartPage;

