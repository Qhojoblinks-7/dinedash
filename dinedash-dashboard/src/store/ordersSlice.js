import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

/**
 * Environment-based URL resolution with proper fallback logic
 */
const getApiBaseUrl = () => {
  // Use environment variable for production, fallback to localhost for development
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

// Thunk: finalize payment for an order
// This thunk assumes a separate API view exists for payment initiation after an order is created.
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

// Thunk: verify payment for an order
export const verifyPayment = createAsyncThunk('orders/verifyPayment', async ({ orderId, txRef }, thunkAPI) => {
    try {
        // Uses the mock-verify endpoint on the deployed backend
        const response = await axios.get(`${PAYMENT_API_URL}mock-verify/?tx_ref=${txRef}&order_id=${orderId}&status=successful`);
        return response.data; // updated payment
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
    }
});

// Thunk: update order status
export const updateOrderStatus = createAsyncThunk('orders/updateOrderStatus', async ({ orderId, status }, thunkAPI) => {
    try {
        console.log('Updating order status:', orderId, 'to', status);
        // NOTE: Ensure your backend has an endpoint for PATCH /api/orders/{orderId}/status/
        const response = await axios.patch(`${API_URL}${orderId}/status/`, { status });
        console.log('Order status update response:', response.data);
        return response.data; // updated order
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
        // Optional: allow local updates
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
                console.log('Updating order', updatedOrder.id, 'status', updatedOrder.status, 'index', index);
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