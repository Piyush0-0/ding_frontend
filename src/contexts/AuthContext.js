import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in using the verify-token endpoint
    const checkAuth = async () => {
      try {
        console.log("Checking authentication status...");
        const response = await apiClient.get("/auth/verify-token");
        console.log("Verify token response:", response.data);
        
        if (response.data.isValid) {
          // If token is valid, fetch user data
          console.log("Token is valid, fetching user data...");
          const userResponse = await apiClient.get("/auth/me");
          console.log("User data:", userResponse.data);
          setUser(userResponse.data);
        } else {
          console.log("Token is not valid");
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 