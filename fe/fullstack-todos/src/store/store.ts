import { configureStore } from "@reduxjs/toolkit";
import todosReducer from "../features/todosSlice";
import authReducer from "../features/authSlice";
import userReducer from "../features/usersSlice";

export const store = configureStore({
    reducer: {
        todos: todosReducer,
        auth: authReducer,
        users: userReducer,
    },
    });

    export type RootState = ReturnType<typeof store.getState>;
    export type AppDispatch = typeof store.dispatch;