import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from '../store';

interface Authstate {
    accessToken: string | null;
    role: string | null;
    name : string | null;
}

const initialState: Authstate = {
    accessToken: null,
    role: null,
    name: null,
}

export const authSlice = createSlice({
    name:"auth",
    initialState,
    reducers:{
        setAccessToken: (state, action: PayloadAction<string | null>) =>{
            state.accessToken = action.payload;
        },
        setRole: (state, action: PayloadAction<string | null>) =>{
            state.role = action.payload;
        },
        setName: (state, action: PayloadAction<string | null>) =>{
            state.name = action.payload;
        },
        clearAccessToken: (state) =>{
            state.accessToken = null;
        },
        clearRole: (state) =>{
            state.role = null;
        },
        clearName: (state) =>{
            state.name = null;
        },
        logout: (state)=>{
            state.accessToken = null;
            state.role = null;
            state.name = null;
        }
    },
});

export const { setAccessToken, setRole, clearAccessToken, clearRole, logout, setName, clearName } = authSlice.actions;

// ✅ Selectors
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectUserRole = (state: RootState) => state.auth.role;
export const selectUserName = (state: RootState) => state.auth.name;


export default authSlice.reducer;