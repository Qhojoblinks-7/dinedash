/**
 * API Service for DineDash Dashboard
 * Provides centralized HTTP client functionality with error handling, caching, and performance optimizations
 */

// Configuration constants
const CONFIG = {
  DEFAULT_TIMEOUT: 10000, // 10 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
};

// Environment-based URL resolution with proper fallback logic
const getApiBaseUrl = () => {
  // Use environment variable if available, fallback to localhost for development
  return import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Custom error classes for better error handling
class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NetworkError';
  }
}

class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * API Service Class
 * Handles all HTTP requests with built-in error handling, caching, and performance optimizations
 */
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.cache = new Map();
    this.activeRequests = new Map();
  }

  /**
   * Creates an AbortController for request cancellation
   * @returns {AbortController} Controller for cancelling requests
   */
  createAbortController() {
    return new AbortController();
  }

  /**
   * Generates cache key for requests
   * @param {string} url - Request URL
   * @param {object} options - Request options
   * @returns {string} Cache key
   */
  getCacheKey(url, options = {}) {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  /**
   * Checks if cached response is still valid
   * @param {object} cached - Cached response object
   * @returns {boolean} Whether cache is valid
   */
  isCacheValid(cached) {
    return Date.now() - cached.timestamp < CONFIG.CACHE_TTL;
  }

  /**
   * Retrieves cached response if available and valid
   * @param {string} cacheKey - Cache key
   * @returns {any|null} Cached data or null
   */
  getCachedResponse(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(cacheKey);
    }
    return null;
  }

  /**
   * Caches response data
   * @param {string} cacheKey - Cache key
   * @param {any} data - Response data to cache
   */
  setCachedResponse(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Sleeps for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after delay
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Makes HTTP request with retry logic and error handling
   * @param {string} endpoint - API endpoint
   * @param {object} options - Request options
   * @param {number} retryCount - Current retry attempt
   * @returns {Promise<any>} Response data
   */
  async request(endpoint, options = {}, retryCount = 0) {
    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = this.getCacheKey(url, options);

    // Return cached response for GET requests
    if (options.method === 'GET' || !options.method) {
      const cached = this.getCachedResponse(cacheKey);
      if (cached) return cached;
    }

    // Prevent duplicate requests
    if (this.activeRequests.has(cacheKey)) {
      return this.activeRequests.get(cacheKey);
    }

    const requestPromise = this._performRequest(url, options, retryCount);
    this.activeRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;

      // Cache successful GET responses
      if ((options.method === 'GET' || !options.method) && result) {
        this.setCachedResponse(cacheKey, result);
      }

      return result;
    } finally {
      this.activeRequests.delete(cacheKey);
    }
  }

  /**
   * Performs the actual HTTP request
   * @param {string} url - Full request URL
   * @param {object} options - Request options
   * @param {number} retryCount - Current retry attempt
   * @returns {Promise<any>} Response data
   */
  async _performRequest(url, options, retryCount) {
    const controller = options.signal || this.createAbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.DEFAULT_TIMEOUT);

    const config = {
      method: 'GET',
      headers: {
        // Don't set Content-Type for FormData, let browser handle it
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await this.safeJsonParse(response);
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      const data = await this.safeJsonParse(response);
      return data;

    } catch (error) {
      clearTimeout(timeoutId);

      // Handle different error types
      if (error.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }

      if (error instanceof ApiError) {
        throw error;
      }

      if (error.message.includes('fetch')) {
        if (retryCount < CONFIG.MAX_RETRIES) {
          await this.sleep(CONFIG.RETRY_DELAY * Math.pow(2, retryCount));
          return this.request(url.replace(this.baseURL, ''), options, retryCount + 1);
        }
        throw new NetworkError('Network request failed after retries');
      }

      if (error.message.includes('timeout')) {
        throw new TimeoutError('Request timed out');
      }

      throw error;
    }
  }

  /**
   * Safely parses JSON response, handling non-JSON responses
   * @param {Response} response - Fetch response object
   * @returns {Promise<any>} Parsed JSON or null
   */
  async safeJsonParse(response) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Cancels all active requests
   */
  cancelAllRequests() {
    this.activeRequests.forEach((promise) => {
      if (promise.abort) promise.abort();
    });
    this.activeRequests.clear();
  }

  /**
   * Clears the response cache
   */
  clearCache() {
    this.cache.clear();
  }

  // Meals API methods
  /**
   * Fetches all meals
   * @returns {Promise<Array>} List of meals
   */
  async getMeals() {
    return this.request('/meals/');
  }

  /**
   * Fetches a specific meal by ID
   * @param {string|number} id - Meal ID
   * @returns {Promise<object>} Meal data
   */
  async getMeal(id) {
    return this.request(`/meals/${id}/`);
  }

  /**
   * Creates a new meal
   * @param {object} mealData - Meal data
   * @returns {Promise<object>} Created meal
   */
  async createMeal(mealData) {
    return this.request('/meals/', {
      method: 'POST',
      body: JSON.stringify(mealData),
    });
  }

  // Orders API methods
  /**
   * Fetches all orders
   * @returns {Promise<Array>} List of orders
   */
  async getOrders() {
    return this.request('/orders/');
  }

  /**
   * Fetches a specific order by ID
   * @param {string|number} id - Order ID
   * @returns {Promise<object>} Order data
   */
  async getOrder(id) {
    return this.request(`/orders/${id}/`);
  }

  /**
   * Creates a new order
   * @param {object} orderData - Order data
   * @returns {Promise<object>} Created order
   */
  async createOrder(orderData) {
    return this.request('/orders/create/', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  /**
   * Updates order status
   * @param {string|number} id - Order ID
   * @param {string} status - New status
   * @returns {Promise<object>} Updated order
   */
  async updateOrderStatus(id, status) {
    return this.request(`/orders/${id}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  /**
   * Processes checkout
   * @param {object} checkoutData - Checkout data
   * @returns {Promise<object>} Checkout result
   */
  async checkout(checkoutData) {
    return this.request('/orders/checkout/', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    });
  }

  // Tables API methods (Mock data - replace with real API when available)
  /**
   * Fetches all tables
   * @returns {Promise<Array>} List of tables
   */
  async getTables() {
    // Mock table data - replace with real API call when backend is ready
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