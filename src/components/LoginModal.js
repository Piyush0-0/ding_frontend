import React, { useState } from "react";
import axios from "axios";
import { getSessionId } from "../utils/session";
import apiClient from "../api/apiClient";
import { useAuth } from "../contexts/AuthContext";

const LoginModal = ({ onClose, onLoginSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const sessionId = getSessionId();
  const { login } = useAuth();

  const isValidPhoneNumber = (number) => {
    // Remove any non-digit characters
    const cleanedNumber = number.replace(/\D/g, '');
    // Check if the cleaned number has exactly 10 digits
    return cleanedNumber.length === 10;
  };

  const sendOtp = async () => {
    if (!isValidPhoneNumber(phoneNumber)) return;
    try {
      await apiClient.post("/auth/send-otp", {
        phoneNumber,
      });
      setOtpSent(true);
    } catch (error) {
      console.error("Failed to send OTP:", error);
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await apiClient.post("/auth/verify-otp", {
        phoneNumber,
        sessionId,
        otp,
      });
      
      // Get user data after successful login
      const userResponse = await apiClient.get("/auth/me");
      login(userResponse.data);
      
      onLoginSuccess(phoneNumber);
      onClose();
    } catch (error) {
      console.error("Failed to verify OTP:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-md shadow-lg w-80">
        <h2 className="text-base font-bold mb-4 font-raleway">Login</h2>
        {!otpSent ? (
          <>
            <input
              type="text"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full p-2 border rounded-md mb-4 text-xs"
            />
            {phoneNumber && !isValidPhoneNumber(phoneNumber) && (
              <p className="text-red-500 text-xs font-raleway -mt-3 mb-4">Please enter a valid 10-digit phone number</p>
            )}
            <button
              onClick={sendOtp}
              disabled={!isValidPhoneNumber(phoneNumber)}
              className={`w-full py-1.5 rounded-md text-xs font-raleway ${
                isValidPhoneNumber(phoneNumber)
                  ? "bg-[#c90024] text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Send OTP
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border rounded-md mb-4 text-xs"
            />
            <button
              onClick={verifyOtp}
              className="w-full bg-[#c90024] text-white py-1.5 rounded-md text-xs font-raleway"
            >
              Verify OTP
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
