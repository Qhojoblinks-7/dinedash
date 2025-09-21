// API service for communicating with Django backend
const API_BASE_URL = 'http://localhost:8000';

export const apiService = {
  // Create a new order
  createOrder: async (orderData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  },

  // Get all meals
  getMeals: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/meals/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  },

  // Get all orders (staff only)
  getOrders: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }
};

export default apiService;
