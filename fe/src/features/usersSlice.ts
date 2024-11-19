import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User, UsersState } from '../types/auth';
import axios from '../utils/axios';
import { API_URL } from '../config/api';

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/users');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
        }
    }
);

export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async (id: number, { rejectWithValue }) => {
        try {
            await axios.delete(`/delete_user/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
        }
    }
);

const usersSlice = createSlice({
    name: 'users',
    initialState: {
        users: [],
        status: 'idle',
        error: null
    } as UsersState,
    reducers: {},
        extraReducers: (builder) => {
            builder
                .addCase(fetchUsers.pending, (state) => {
                    state.status = 'loading';
                    state.error = null;
                })
                .addCase(fetchUsers.fulfilled, (state, action) => {
                    state.status = 'succeeded';
                    state.users = action.payload;
                    state.error = null;
                })
                .addCase(fetchUsers.rejected, (state, action) => {
                    state.status = 'failed';
                    state.error = action.payload as string;
                })
                .addCase(deleteUser.fulfilled, (state, action) => {
                    state.users = state.users.filter(user => user.id !== action.payload);
                    state.error = null;
                })
                .addCase(deleteUser.rejected, (state, action) => {
                    state.error = action.payload as string;
                });
    }
});

export default usersSlice.reducer;