import { configureStore } from '@reduxjs/toolkit';
import mealsReducer from './mealsSlice';
import cartReducer from './cartSlice';
import ordersReducer from './ordersSlice';

const store = configureStore({
  reducer: {
    meals: mealsReducer,
    cart: cartReducer,
    orders: ordersReducer,
  },
});

export default store;