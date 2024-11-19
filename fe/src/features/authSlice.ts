import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import { AuthState, LoginCredentials, RegisterCredentials } from '../types/auth';
import { API_URL } from '../config/api';

// Recover initial state from localStorage
const loadAuthState = (): AuthState => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return {
        token: token,
        user: user ? JSON.parse(user) : null,
        status: 'idle',
        error: null,
        isAuthenticated: !!token,
    };
};

    const initialState: AuthState = loadAuthState(); // load initial state from localStorage

    export const login = createAsyncThunk( // createAsyncThunk is a function that takes an action type string and a payload creator callback function that should return a promise containing the response data.
        '/login',
        async (credentials: LoginCredentials) => {
            const response = await axios.post(`${API_URL}/auth/login`, credentials);
            
            // Save token and user in localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            return response.data;
        }
    );

    export const register = createAsyncThunk(
        '/register',
        async (credentials: RegisterCredentials) => {
            const response = await axios.post(`${API_URL}/auth/register`, credentials);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            return response.data;
        }
    );

    export const logout = createAsyncThunk(
        '/logout',
        async (_, { rejectWithValue }) => {
            try {
                await axios.post(`${API_URL}/auth/logout`);
                // Clear storage and headers even if the request fails
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                delete axios.defaults.headers.common['Authorization'];
                return null;
            } catch (error) {
                // Still clear everything even on error
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                delete axios.defaults.headers.common['Authorization'];
                return rejectWithValue(error);
            }
        }
    );

    const authSlice = createSlice({
        name: 'auth',
        initialState,
        reducers: {
            clearAuthError: (state) => {
                state.error = null;
        },
    },
        extraReducers: (builder) => { // extraReducers is a callback function that receives a builder object that lets you define additional reducers outside of the createSlice call
            builder

            // Login cases

            .addCase(login.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Login failed';
                state.isAuthenticated = false;
            })

            // Register cases

            .addCase(register.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(register.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Register failed';
                state.isAuthenticated = false;
            })

            // Logout cases

            .addCase(logout.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(logout.fulfilled, (state) => {
                state.status = 'idle';
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.error = null;
            })
            .addCase(logout.rejected, (state, action) => {
                state.status = 'idle';
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.error = null;
            });
        }
    });

    export const { clearAuthError } = authSlice.actions;
    export default authSlice.reducer;