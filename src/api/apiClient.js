import axios from "axios";

// Create an Axios instance
const apiClient = axios.create({
  baseURL: "http://localhost:8080/api", //"https://myding.in/api", Backend base URL
  withCredentials: true, // Include cookies in all requests
  headers: {
    "Content-Type": "application/json", // Default headers
  },
});

// Interceptor to handle expired tokens
apiClient.interceptors.response.use(
  (response) => response, // Pass successful responses
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle expired tokens
      alert("Session expired. Please log in again.");
      window.location.href = "/"; // Redirect to home page
    }
    return Promise.reject(error);
  }
);

// Restaurant endpoints
export const getRestaurant = (restaurantId) => 
  apiClient.get(`/restaurants/${restaurantId}`);

export const getRestaurantCategories = (restaurantId) =>
  apiClient.get(`/restaurants/${restaurantId}/categories`);

export const getRestaurantItems = (restaurantId) =>
  apiClient.get(`/restaurants/${restaurantId}/items`);

export const getAllRestaurants = () =>
  apiClient.get('/restaurants');

// Group Order endpoints
export const createGroupOrder = (restaurantId, locationType, tableId = null, locationDetails = null) =>
  apiClient.post('/order-groups/create', { restaurant_id: restaurantId, location_type: locationType, table_id: tableId, location_details: locationDetails });

export const getGroupOrderByCode = (qrCode) =>
  apiClient.get(`/order-groups/by-code/${qrCode}`);

export const joinGroupOrder = (groupId) =>
  apiClient.post(`/order-groups/${groupId}/join`);

export const leaveGroupOrder = (groupId) =>
  apiClient.post(`/order-groups/${groupId}/leave`);

export const getGroupOrderStatus = (groupId) =>
  apiClient.get(`/order-groups/${groupId}/status`);

export const finalizeGroupOrder = (groupId) =>
  apiClient.post(`/order-groups/${groupId}/finalize`);

export default apiClient;
