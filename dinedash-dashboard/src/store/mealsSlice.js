import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

/**
 * Environment-based URL resolution with proper fallback logic
 */
const getApiBaseUrl = () => {
  // Use environment variable for production, fallback to localhost for development
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  return baseUrl.endsWith('/') ? `${baseUrl}meals/` : `${baseUrl}/meals/`;
};

const API_URL = getApiBaseUrl();

export const fetchMeals = createAsyncThunk('meals/fetchMeals', async (_, thunkAPI) => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const createMeal = createAsyncThunk('meals/createMeal', async (mealData, thunkAPI) => {
  try {
    const response = await axios.post(API_URL, mealData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const deleteMeal = createAsyncThunk('meals/deleteMeal', async (mealId, thunkAPI) => {
  try {
    await axios.delete(`${API_URL}${mealId}/`);
    return mealId;
  } catch (error) {
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
      })
      .addCase(deleteMeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMeal.fulfilled, (state, action) => {
        state.loading = false;
        state.meals = state.meals.filter(meal => meal.id !== action.payload);
      })
      .addCase(deleteMeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addMeal, removeMeal } = mealsSlice.actions;
export default mealsSlice.reducer;