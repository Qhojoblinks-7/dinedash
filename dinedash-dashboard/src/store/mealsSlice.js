// src/store/mealsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Adjust base URL depending on your backend setup
const API_URL = 'http://localhost:8000/api/meals/';

// Thunk: fetch meals from backend
export const fetchMeals = createAsyncThunk('meals/fetchMeals', async (_, thunkAPI) => {
  try {
    const response = await axios.get(API_URL);
    return response.data; // should be an array of meals
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Thunk: create a new meal
export const createMeal = createAsyncThunk('meals/createMeal', async (mealData, thunkAPI) => {
  try {
    const response = await axios.post(API_URL, mealData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // the created meal
  } catch (error) {
    console.error('Create meal error:', error.response?.data);
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const mealsSlice = createSlice({
  name: 'meals',
  initialState: {
    meals: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Optional: allow local updates
    addMeal: (state, action) => {
      state.meals.push(action.payload);
    },
    removeMeal: (state, action) => {
      state.meals = state.meals.filter((meal) => meal.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMeals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMeals.fulfilled, (state, action) => {
        state.loading = false;
        state.meals = action.payload;
      })
      .addCase(fetchMeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createMeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMeal.fulfilled, (state, action) => {
        state.loading = false;
        state.meals.push(action.payload);
      })
      .addCase(createMeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addMeal, removeMeal } = mealsSlice.actions;
export default mealsSlice.reducer;