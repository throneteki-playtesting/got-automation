import { createSlice } from "@reduxjs/toolkit";
import { User } from "common/models/user";

interface AuthState {
    user?: User
}

const initialState: AuthState = {
    user: undefined
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser(state, action) {
            state.user = action.payload;
        }
    }
});

export const {
    setUser
} = authSlice.actions;

export default authSlice.reducer;