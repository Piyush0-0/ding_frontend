import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [cartTotals, setCartTotals] = useState({ 
    subtotal: 0, 
    total: 0,
    deliveryCharge: 0,
    packagingCharge: 0,
    serviceCharge: 0,
    taxAmount: 0,
    breakdown: {
      itemTotal: 0,
      deliveryCharge: 0,
      packagingCharge: 0,
      serviceCharge: 0,
      taxAmount: 0
    }
  });
  const [minOrderAmount, setMinOrderAmount] = useState(0);
  const [orderGroup, setOrderGroup] = useState(null);

  const updateCart = (newCart, newTotals, newMinOrderAmount) => {
    setCart(newCart);
    setCartTotals(newTotals);
    setMinOrderAmount(newMinOrderAmount);
  };

  const joinOrderGroup = (groupData) => {
    setOrderGroup(groupData);
  };

  const leaveOrderGroup = () => {
    setOrderGroup(null);
  };

  const isInOrderGroup = () => {
    return orderGroup !== null;
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      cartTotals, 
      minOrderAmount,
      orderGroup,
      updateCart,
      joinOrderGroup,
      leaveOrderGroup,
      isInOrderGroup
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 
