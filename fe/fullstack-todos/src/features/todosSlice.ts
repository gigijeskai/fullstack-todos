import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { Todo, TodosState } from '../types/todo';
import axios from 'axios';

const initialState: TodosState = {
    todos: [],
    loading: false,
    error: null,
  };

const API_URL = 'http://localhost:5000';

export const fetchTodos = createAsyncThunk<Todo[]>('todos/fetchTodos', async () => {
  const response = await axios.get(`${API_URL}/todos`);
  return response.data.todos;
});

export const createTodo = createAsyncThunk<Todo, string>('todos/createTodo', async (title: string) => {
    const response = await axios.post(`${API_URL}/todos`, { title });
    return response.data.message;  
});

export const updateTodo = createAsyncThunk('todos/updateTodo', async ({ id, title, done }: { id: number, title: string, done: boolean }) => {
    const response = await axios.patch(`${API_URL}/update_todos/${id}`, { title, done });
    return response.data.message;
});

export const deleteTodo = createAsyncThunk<number, number>('todos/deleteTodo', async (id: number) => {
    const response = await axios.delete(`${API_URL}/delete_todos/${id}`);
    return response.data.message;
});

const todoSlice = createSlice({
    name: 'todos',
    initialState: {
        todos: [] as { id: number, title: string, done: boolean }[],
        loading: false,
        error: null as string | null
    },
    reducers: {},
    extraReducers: (builder) => {
        // Gestione di fetchTodos
        builder.addCase(fetchTodos.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchTodos.fulfilled, (state, action) => {
            state.loading = false;
            state.todos = action.payload;
        });
        builder.addCase(fetchTodos.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Failed to fetch todos';
        });

        // Gestione di createTodo
        builder.addCase(createTodo.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(createTodo.fulfilled, (state, action) => {
            state.loading = false;
            state.todos.push(action.payload); // Aggiorna lo stato con il nuovo todo
        });
        builder.addCase(createTodo.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Failed to create todo';
        });

        // Gestione di updateTodo
        builder.addCase(updateTodo.fulfilled, (state, action) => {
            const index = state.todos.findIndex(todo => todo.id === action.meta.arg.id);
            if (index !== -1) {
                state.todos[index] = { ...state.todos[index], ...action.meta.arg };
            }
        });

        // Gestione di deleteTodo
        builder.addCase(deleteTodo.fulfilled, (state, action) => {
            state.todos = state.todos.filter(todo => todo.id !== action.meta.arg);
        });
    }
});

export default todoSlice.reducer;