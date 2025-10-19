import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

/**
 * Get the API base URL, using environment variables for different environments
 */
const getApiBaseUrl = () => {
  // Check for production URL, otherwise use local development server
  return import.meta.env.VITE_API_URL || 'http://localhost:8000';
};

const BASE_URL = getApiBaseUrl();
const API_URL = BASE_URL.endsWith('/') ? `${BASE_URL}api/orders/` : `${BASE_URL}/api/orders/`;
const PAYMENT_API_URL = BASE_URL.endsWith('/') ? `${BASE_URL}api/payments/` : `${BASE_URL}/api/payments/`;

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (_, thunkAPI) => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

// Complete the payment process for an order
// This connects to a backend endpoint that handles payment finalization
export const finalizePayment = createAsyncThunk('orders/finalizePayment', async ({ orderId, paymentMethod, amount }, thunkAPI) => {
    try {
        const response = await axios.post(`${PAYMENT_API_URL}mock-initiate/`, {
            order_id: orderId,
            payment_method: paymentMethod,
            amount: amount,
        });
        return response.data; // payment details, potentially including a redirect link
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
    }
});

// Check if a payment was successful
export const verifyPayment = createAsyncThunk('orders/verifyPayment', async ({ orderId, txRef }, thunkAPI) => {
    try {
        // Connect to the backend's payment verification endpoint
        const response = await axios.get(`${PAYMENT_API_URL}mock-verify/?tx_ref=${txRef}&order_id=${orderId}&status=successful`);
        return response.data; // the verified payment details
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
    }
});

// Change an order's status (like from pending to in progress)
export const updateOrderStatus = createAsyncThunk('orders/updateOrderStatus', async ({ orderId, status }, thunkAPI) => {
    try {
        console.log('Updating order status:', orderId, 'to', status);
        // Make sure the backend has the right endpoint for this
        const response = await axios.patch(`${API_URL}${orderId}/status/`, { status });
        console.log('Order status update response:', response.data);
        return response.data; // the updated order information
    } catch (error) {
        console.error('Error updating order status:', error);
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

const ordersSlice = createSlice({
    name: 'orders',
    initialState: {
        orders: [],
        loading: false,
        error: null,
    },
    reducers: {
        // Allow adding orders directly to the store if needed
        addOrder: (state, action) => {
            state.orders.push(action.payload);
        },
        updateOrder: (state, action) => {
            const index = state.orders.findIndex(order => order.id === action.payload.id);
            if (index !== -1) {
                state.orders[index] = action.payload;
            }
        },
        removeOrder: (state, action) => {
            state.orders = state.orders.filter((order) => order.id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.results || (Array.isArray(action.payload) ? action.payload : []);
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateOrderStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.loading = false;
                const updatedOrder = action.payload;
                const index = state.orders.findIndex(order => String(order.id) === String(updatedOrder.id));
                console.log('Updating order', updatedOrder.id, 'to status', updatedOrder.status, 'at index', index);
                if (index !== -1) {
                    state.orders[index] = updatedOrder;
                }
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { addOrder, updateOrder, removeOrder } = ordersSlice.actions;
export default ordersSlice.reducer;