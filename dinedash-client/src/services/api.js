const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

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
