import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { User } from "common/models/user";
import { RootState } from "./store";
import api from ".";

interface AuthState {
    user?: User,
    error?: string,
    status: "idle" | "loading" | "succeeded" | "failed"
}

const initialState: AuthState = {
    user: undefined,
    status: "idle",
    error: undefined
};

export const loginAsync = createAsyncThunk<User, void, { state: RootState }>(
    "auth/login",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await dispatch(api.endpoints.login.initiate());
            if (response.data) {
                return response.data;
            } else {
                return rejectWithValue("Failed to login");
            }
        } catch (err) {
            console.log(err);
            return rejectWithValue("An unexpected error occurred");
        }
    }
);

export const logoutAsync = createAsyncThunk<void, void, { state: RootState }>(
    "auth/logout",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            await dispatch(api.endpoints.logout.initiate());
        } catch (err) {
            console.log(err);
            return rejectWithValue("An unexpected error occurred");
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loginAsync.pending, (state) => {
                state.status = "loading";
            })
            .addCase(loginAsync.fulfilled, (state, { payload }) => {
                state.status = "succeeded";
                state.user = payload;
            })
            .addCase(loginAsync.rejected, (state, { payload }) => {
                state.status = "failed";
                state.error = payload as string;
            })
            .addCase(logoutAsync.pending, (state) => {
                state.status = "loading";
            })
            .addCase(logoutAsync.fulfilled, (state) => {
                state.status = "succeeded";
                state.user = undefined;
            })
            .addCase(logoutAsync.rejected, (state, { payload }) => {
                state.status = "failed";
                state.error = payload as string;
            });
    }
});

export default authSlice.reducer;