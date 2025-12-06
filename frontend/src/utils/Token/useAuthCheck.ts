// this is called because there is no accessToken or role in the store

import { api } from "../api/Employees/api"
import { selectUserName, setAccessToken, setRole } from "../../redux/slice/authSlice";

export const AuthCheck = async (dispatch: any) => {
    try {
        const response = await api.auth.authCheck.get();

        dispatch(setAccessToken(response.accessToken));
        dispatch(setRole(response.role));
        dispatch(selectUserName(response.name));
        return;
    } catch (error) {
        console.error("Auth check failed:", error);
        throw error; // Re-throw to handle it in the component if needed
    }
}