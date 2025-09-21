import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  drawerOpen: false,
  notes: '',
  lastOrderId: null,
  checkoutStatus: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action) {
      const item = action.payload;
      const idx = state.items.findIndex((i) => i.id === item.id);
      if (idx === -1) {
        state.items.push({ ...item, qty: 1 });
      } else {
        state.items[idx].qty += 1;
      }
      state.drawerOpen = true;
    },
    changeQty(state, action) {
      const { id, qty } = action.payload;
      state.items = state.items.map((i) => (i.id === id ? { ...i, qty } : i)).filter((i) => i.qty > 0);
    },
    removeItem(state, action) {
      const id = action.payload;
      state.items = state.items.filter((i) => i.id !== id);
    },
    clearCart(state) {
      state.items = [];
      state.lastOrderId = null;
    },
    setNotes(state, action) {
      state.notes = action.payload;
    },
    toggleDrawer(state, action) {
      state.drawerOpen = typeof action.payload === 'boolean' ? action.payload : !state.drawerOpen;
    },
    setLastOrderId(state, action) {
      state.lastOrderId = action.payload;
    },
    setCheckoutStatus(state, action) {
      state.checkoutStatus = action.payload;
    },
  },
});
export const { addItem, changeQty, removeItem, clearCart, setNotes, toggleDrawer, setLastOrderId, setCheckoutStatus } = cartSlice.actions;
export default cartSlice.reducer;
