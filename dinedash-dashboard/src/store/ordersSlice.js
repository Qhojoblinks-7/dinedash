// src/store/ordersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Adjust base URL depending on your backend setup
const API_URL = 'http://localhost:8000/api/orders/';
const PAYMENT_API_URL = 'http://localhost:8000/api/payments/';

// Thunk: fetch orders from backend
export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (_, thunkAPI) => {
  try {
    const response = await axios.get(API_URL);
    return response.data; // should be an array of orders
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Thunk: finalize payment for an order
export const finalizePayment = createAsyncThunk('orders/finalizePayment', async ({ orderId, paymentMethod, amount }, thunkAPI) => {
  try {
    const response = await axios.post(`${PAYMENT_API_URL}finalize/`, {
      order_id: orderId,
      payment_method: paymentMethod,
      amount: amount,
    });
    return response.data; // payment details
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
  }
});

// Thunk: verify payment for an order
export const verifyPayment = createAsyncThunk('orders/verifyPayment', async ({ orderId, txRef }, thunkAPI) => {
  try {
    const response = await axios.get(`${PAYMENT_API_URL}mock-verify/?tx_ref=${txRef}&order_id=${orderId}&status=successful`);
    return response.data; // updated payment
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
  }
});

// Thunk: update order status
export const updateOrderStatus = createAsyncThunk('orders/updateOrderStatus', async ({ orderId, status }, thunkAPI) => {
  try {
    const response = await axios.patch(`${API_URL}${orderId}/status/`, { status });
    return response.data; // updated order
  } catch (error) {
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
        state.orders = action.payload;
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