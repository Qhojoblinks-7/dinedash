import { configureStore } from '@reduxjs/toolkit';
import mealsReducer from './mealsSlice';
import cartReducer from './cartSlice';

const store = configureStore({
  reducer: {
    meals: mealsReducer,
    cart: cartReducer,
  },
});

export default store;
