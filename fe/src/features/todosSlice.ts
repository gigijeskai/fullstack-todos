import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TodosState } from '../types/todo';
import axios from '../utils/axios';
import { API_URL } from '../config/api';

axios.defaults.headers.common['Content-Type'] = 'application/json';

export const fetchTodos = createAsyncThunk(
    'todos/fetchTodos',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/todos');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch todos');
        }
    }
);

export const createTodo = createAsyncThunk(
    'todos/createTodo',
    async (title: string, { rejectWithValue }) => {
        try {
            const response = await axios.post('/create_todos', { title });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create todo');
        }
    }
);

export const updateTodo = createAsyncThunk(
    'todos/updateTodo',
    async ({ id, title, done }: { id: number; title: string; done: boolean }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch(`/update_todos/${id}`, { title, done }, 
                { headers: { Authorization: `Bearer ${token}` ,
                                'Content-Type': 'application/json',
            } });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update todo');
        }
    }
);

export const deleteTodo = createAsyncThunk(
    'todos/deleteTodo',
    async (id: number, { rejectWithValue }) => {
        try {
            await axios.delete(`/delete_todos/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete todo');
        }
    }
);

const todoSlice = createSlice({
    name: 'todos',
    initialState: {
        todos: [],
        status: 'idle',
        error: null
    } as TodosState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTodos.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchTodos.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.todos = action.payload;
                state.error = null;
            })
            .addCase(fetchTodos.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(createTodo.fulfilled, (state, action) => {
                state.todos.push(action.payload);
                state.error = null;
            })
            .addCase(createTodo.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            .addCase(updateTodo.fulfilled, (state, action) => {
                const index = state.todos.findIndex(todo => todo.id === action.payload.id);
                if (index !== -1) {
                    state.todos[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(updateTodo.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            .addCase(deleteTodo.fulfilled, (state, action) => {
                state.todos = state.todos.filter(todo => todo.id !== action.payload);
                state.error = null;
            })
            .addCase(deleteTodo.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    }
});

export const { clearError } = todoSlice.actions;
export default todoSlice.reducer;