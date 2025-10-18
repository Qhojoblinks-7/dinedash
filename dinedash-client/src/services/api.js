/**
 * API Service for DineDash Client
 * Provides centralized HTTP client functionality with environment-aware URL configuration
 */

// Environment-based URL resolution with proper fallback logic
const getApiBaseUrl = () => {
  // Use environment variable for production, fallback to localhost for development
  return import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
};

const API_BASE_URL = getApiBaseUrl();

const makeRequest = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
};

export const apiService = {
  createOrder: (orderData) => makeRequest(`${API_BASE_URL}/orders/create/`, {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),

  getMeals: () => makeRequest(`${API_BASE_URL}/meals/`),

  getOrders: () => makeRequest(`${API_BASE_URL}/orders/`),

  getOrder: (orderId) => makeRequest(`${API_BASE_URL}/orders/${orderId}/`),

  initiatePayment: (orderId, paymentMethod) => makeRequest(`${API_BASE_URL}/payments/mock-pay/`, {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId, payment_method: paymentMethod }),
  }),

  checkout: (checkoutData) => makeRequest(`${API_BASE_URL}/orders/checkout/`, {
    method: 'POST',
    body: JSON.stringify(checkoutData),
  }),
};

export default apiService;
