const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Meals
  async getMeals() {
    return this.request('/meals/');
  }

  async getMeal(id) {
    return this.request(`/meals/${id}/`);
  }

  // Orders
  async getOrders() {
    return this.request('/orders/');
  }

  async getOrder(id) {
    return this.request(`/orders/${id}/`);
  }

  async createOrder(orderData) {
    return this.request('/orders/create/', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(id, status) {
    return this.request(`/orders/${id}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async checkout(checkoutData) {
    return this.request('/orders/checkout/', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    });
  }

  // Tables - Mock data for now since no table API exists
  async getTables() {
    // Mock table data - in a real app this would come from backend
    return [
      { id: 'table_1', tableNumber: 'T1', status: 'process', seats: 4 },
      { id: 'table_2', tableNumber: 'T2', status: 'kitchen', seats: 2 },
      { id: 'table_3', tableNumber: 'T3', status: 'available', seats: 6 },
      { id: 'table_4', tableNumber: 'T4', status: 'occupied', seats: 4 },
      { id: 'table_5', tableNumber: 'T5', status: 'available', seats: 2 },
    ];
  }
}

export const apiService = new ApiService();