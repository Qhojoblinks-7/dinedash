import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/meals/';

export const fetchMeals = createAsyncThunk('meals/fetchMeals', async (_, thunkAPI) => {
  try {
    const response = await axios.get(API_URL);
    return response.data; // should be an array of meals
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
      });
  },
});

export const { addMeal, removeMeal } = mealsSlice.actions;
export default mealsSlice.reducer;
