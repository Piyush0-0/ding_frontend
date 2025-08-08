import { v4 as uuidv4 } from "uuid"; // Install uuid library

export const getSessionId = () => {
  // Check if a session ID exists in localStorage
  let sessionId = localStorage.getItem("session_id");

  // If not, generate a new one
  if (!sessionId) {
    sessionId = uuidv4(); // Generate a unique session ID
    localStorage.setItem("session_id", sessionId); // Store it in localStorage
  }

  return sessionId;
};