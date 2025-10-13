const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dinedash-2-lh2q.onrender.com';

const makeRequest = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
};

export const apiService = {
  createOrder: (orderData) => makeRequest(`${API_BASE_URL}/api/orders/create/`, {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),

  getMeals: () => makeRequest(`${API_BASE_URL}/api/meals/`),

  getOrders: () => makeRequest(`${API_BASE_URL}/api/orders/`),

  getOrder: (orderId) => makeRequest(`${API_BASE_URL}/api/orders/${orderId}/`),

  initiatePayment: (orderId, paymentMethod) => makeRequest(`${API_BASE_URL}/api/payments/mock-pay/`, {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId, payment_method: paymentMethod }),
  }),

  checkout: (checkoutData) => makeRequest(`${API_BASE_URL}/api/orders/checkout/`, {
    method: 'POST',
    body: JSON.stringify(checkoutData),
  }),
};

export default apiService;
