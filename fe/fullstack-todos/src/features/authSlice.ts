import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import { AuthState, LoginCredentials, RegisterCredentials } from '../types/auth';

const API_URL = 'http://localhost:5000';

// Recover initial state from localStorage
const loadAuthState = (): AuthState => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return {
        token: token,
        user: user ? JSON.parse(user) : null,
        status: 'idle',
        error: null,
        isAuthenticated: false,
    };
};

    const initialState: AuthState = loadAuthState(); // load initial state from localStorage

    export const login = createAsyncThunk(
        '/login',
        async (credentials: LoginCredentials) => {
            const response = await axios.post(`${API_URL}/auth/login`, credentials);
            
            // Save token and user in localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data;
        }
    );

    export const register = createAsyncThunk(
        '/register',
        async (credentials: RegisterCredentials) => {
            const response = await axios.post(`${API_URL}/auth/register`, credentials);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data;
        }
    );

    export const logout = createAsyncThunk(
        '/logout',
        async () => {
            const response = await axios.post(`${API_URL}/auth/logout`);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return response.data;
        }
    );

    const authSlice = createSlice({
        name: 'auth',
        initialState,
        reducers: {},
        extraReducers: (builder) => {
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
            })

            // Logout cases

            .addCase(logout.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.status = 'idle';
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            })
            .addCase(logout.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Logout failed';
            });
        }
    });

    export default authSlice.reducer;