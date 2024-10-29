import { configureStore } from "@reduxjs/toolkit";
import todosReducer from "../features/todosSlice";
import authReducer from "../features/authSlice";

export const store = configureStore({
    reducer: {
        todos: todosReducer,
        auth: authReducer,
    },
    });

    export type RootState = ReturnType<typeof store.getState>;
    export type AppDispatch = typeof store.dispatch;