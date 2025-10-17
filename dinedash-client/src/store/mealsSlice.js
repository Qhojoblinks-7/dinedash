import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Dynamically set API URL based on environment variable (Vite)
// Fallback to the specified Render URL if VITE_API_BASE_URL is not set
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dinedash-2-lh2q.onrender.com';
const API_URL = `${BASE_URL}/api/meals/`;

// ----------------------------------------------------------------------
// --- ASYNC THUNKS ---
// ----------------------------------------------------------------------

// Thunk 1: Fetch all meals (Existing)
export const fetchMeals = createAsyncThunk('meals/fetchMeals', async (_, thunkAPI) => {
    try {
        const response = await axios.get(API_URL);
        return response.data; // array of meals
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

// Thunk 2: Create a new meal
export const createMeal = createAsyncThunk('meals/createMeal', async (mealData, thunkAPI) => {
    try {
        const response = await axios.post(API_URL, mealData);
        return response.data; // the newly created meal object
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
});

// Thunk 3: Delete a meal by ID
export const deleteMeal = createAsyncThunk('meals/deleteMeal', async (mealId, thunkAPI) => {
    try {
        await axios.delete(`${API_URL}${mealId}/`);
        return mealId; // Return the ID to easily remove it from the Redux state
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

// ----------------------------------------------------------------------
// --- SLICE DEFINITION ---
// ----------------------------------------------------------------------

const mealsSlice = createSlice({
    name: 'meals',
    initialState: {
        meals: [],
        loading: false,
        error: null,
    },
    reducers: {
        // Standard reducers (kept for synchronous use)
        addMeal: (state, action) => {
            state.meals.push(action.payload);
        },
        removeMeal: (state, action) => {
            state.meals = state.meals.filter((meal) => meal.id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            // --- Fetch Meals ---
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

            // --- Create Meal ---
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
            
            // --- Delete Meal ---
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