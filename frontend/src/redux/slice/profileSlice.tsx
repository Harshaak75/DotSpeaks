import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProfileState {
  name: string | null;
  PackageName: string | null;
}

const initialState: ProfileState = {
  name: null,
  PackageName: null,
};

const savedProfile = localStorage.getItem("profile");
const initialProfile = savedProfile ? JSON.parse(savedProfile) : initialState;

const profileState = createSlice({
  name: "profile",
  initialState: initialProfile,
  reducers: {
    setProfileDetails: (state, action: PayloadAction<ProfileState>) => {
      state.name = action.payload.name;
      state.PackageName = action.payload.PackageName;
      localStorage.setItem("profile", JSON.stringify(state)); // ✅ sync with localStorage
    },
    clearprofile: (state) => {
      state.name = null;
      state.PackageName = null;
      localStorage.removeItem("profile");
    },
  },
});

export const { setProfileDetails, clearprofile } = profileState.actions;

export default profileState.reducer;
