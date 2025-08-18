import { configureStore } from "@reduxjs/toolkit";
import api from ".";
import authSlice from "./authSlice";

export const store = configureStore({
    reducer: {
        auth: authSlice,
        [api.reducerPath]: api.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(api.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;