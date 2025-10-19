import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

/**
 * Environment-based URL resolution with proper fallback logic
 */
const getApiBaseUrl = () => {
  // Use environment variable for production, fallback to localhost for development
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  // Ensure the base URL does not end with a slash, then append the endpoint with a trailing slash
  return `${baseUrl.replace(/\/$/, '')}/meals/`;
};

const API_URL = getApiBaseUrl();

export const fetchMeals = createAsyncThunk('meals/fetchMeals', async (_, thunkAPI) => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    // Standardize error handling to extract message or default
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

/**
 * Assumes mealData is a FormData object created in the component for file uploads.
 */
export const createMeal = createAsyncThunk('meals/createMeal', async (formData, thunkAPI) => {
  try {
    if (!(formData instanceof FormData)) {
      throw new Error("createMeal requires FormData object for file uploads.");
    }
    
    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Meal created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Meal creation error:', error.response?.data || error.message);
    // Return the actual error data (which might contain validation errors)
    return thunkAPI.rejectWithValue(error.response?.data || { message: error.message });
  }
});

/**
 * Handles updating an existing meal. Uses PATCH for partial updates.
 * @param {object} param0 - Contains mealId and formData (FormData object).
 */
export const updateMeal = createAsyncThunk('meals/updateMeal', async ({ mealId, formData }, thunkAPI) => {
  try {
    if (!(formData instanceof FormData)) {
      throw new Error("updateMeal requires FormData object for file uploads.");
    }

    const response = await axios.patch(`${API_URL}${mealId}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log(`Meal ${mealId} updated successfully:`, response.data);
    return response.data; // Return the updated meal object
  } catch (error) {
    console.error('Meal update error:', error.response?.data || error.message);
    return thunkAPI.rejectWithValue(error.response?.data || { message: error.message });
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
        
        const payload = action.payload;
        let mealsData = [];

        // 1. Check if the payload is a paginated object (DRF standard: { results: [] })
        if (payload && Array.isArray(payload.results)) {
            mealsData = payload.results;
        } 
        // 2. Fallback to assume a direct array response (for un-paginated endpoints)
        else if (Array.isArray(payload)) {
            mealsData = payload;
        } 
        
        // 3. Set the state based on what was found
        if (mealsData.length > 0 || Array.isArray(payload)) {
            state.meals = mealsData;
            state.error = null; // Clear any previous error
        } else {
            // This error is now specifically for unexpected formats
            state.error = "Invalid data format received from meal API. Expected array or paginated object.";
            state.meals = [];
        }
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
      // --- Update Meal Handlers ---
      .addCase(updateMeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMeal.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.meals.findIndex(meal => meal.id === action.payload.id);
        if (index !== -1) {
            state.meals[index] = action.payload; // Replace old meal with updated meal
        }
      })
      .addCase(updateMeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // --- Delete Meal Handlers ---
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