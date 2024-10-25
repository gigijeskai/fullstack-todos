import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { Todo, TodosState } from '../types/todo';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

const initialState: TodosState = {
    todos: [],
    status: 'idle',
    error: null
  };

export const fetchTodos = createAsyncThunk<Todo[]>('todos/fetchTodos', async () => {
  const response = await axios.get(`${API_URL}/todos`);
  return response.data.todos;
});

export const createTodo = createAsyncThunk<Todo, string>(
    'todos/createTodo',
    async (title: string) => {
        try {
            console.log('Sending request with title:', title);
            const response = await axios.post(`${API_URL}/create_todos`, { title });
            console.log('Received response:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error details:', error.response?.data);
            throw error;
        }
    }
);

export const updateTodo = createAsyncThunk
<Todo,{ id: number, title: string, done: boolean }>
('todos/updateTodo', async (todoData) => {
    try {
        const response = await axios.patch(
            `${API_URL}/update_todos/${todoData.id}`,
            { title: todoData.title, done: todoData.done }
        );
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.error || 'Error updating todo');
        }
        throw error;
    }
});

export const deleteTodo = createAsyncThunk<number, number>('todos/deleteTodo', async (id: number) => {
    const response = await axios.delete(`${API_URL}/delete_todos/${id}`);
    return response.data.message;
});

const todoSlice = createSlice({
    name: 'todos',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Gestione di fetchTodos
        builder.addCase(fetchTodos.pending, (state) => {
            state.status = 'loading';
        });
        builder.addCase(fetchTodos.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.todos = action.payload;
        });
        builder.addCase(fetchTodos.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.error.message || 'Failed to fetch todos';
        });

        // Gestione di createTodo
        builder.addCase(createTodo.pending, (state) => {
            state.status = 'loading';
        });
        builder.addCase(createTodo.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.todos.push(action.payload); // Aggiorna lo stato con il nuovo todo
        });
        builder.addCase(createTodo.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.error.message || 'Failed to create todo';
            console.error('Create todo failed:', action.error);
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