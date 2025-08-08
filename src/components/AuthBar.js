import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";

const AuthBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log("AuthBar: Checking auth status");
        const response = await apiClient.get("/api/auth/verify-token");
        console.log("AuthBar: Auth status response", response.data);
        setIsLoggedIn(response.data.isValid);
      } catch (error) {
        console.error("AuthBar: Auth check failed", error);
        setIsLoggedIn(false);
      }
    };
    checkAuthStatus();
  }, []);

  const handleLogout = async () => {
    try {
      console.log("AuthBar: Logging out");
      await apiClient.post("/api/auth/logout");
      setIsLoggedIn(false);
      alert("Logged out successfully.");
      window.location.reload();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <div className="auth-bar bg-gray-800 text-white flex justify-end p-4">
      {isLoggedIn ? (
        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="bg-green-500 px-4 py-2 rounded hover:bg-green-600"
        >
          Login
        </button>
      )}
    </div>
  );
};

export default AuthBar;
