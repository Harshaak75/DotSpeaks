import axios from "axios";
import {
  setAccessToken,
  setRole,
} from "../../../redux/slice/authSlice";

const API_BASE_URL = import.meta.env.VITE_SERVER_URL;
console.log("hiiii", API_BASE_URL);

const handleResponse = async (response: Response, dispatch: Function) => {
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Request failed: ${response.status} ${errorBody}`);
  }

  const newAccessToken = response.headers.get("x-new-access-token");
  const newRole = response.headers.get("x-user-role");

  // Dispatch actions to update Redux state
  if (newAccessToken) {
    dispatch(setAccessToken(newAccessToken));
  }
  if (newRole) {
    dispatch(setRole(newRole));
  }

  return response.json();
};

export const gfx_designer = {
  // COO API endpoints
  coo: {
    profile: {
      get: async (accessToken: any, dispatch: Function) => {
        const response = await fetch(`${API_BASE_URL}/coo/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include", // Include cookies in the request
        });
        return handleResponse(response, dispatch); // Use the helper
      },
      update: async (data: any, accessToken: any, dispatch: Function) => {
        const response = await fetch(`${API_BASE_URL}/coo/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include", // Include cookies in the request
          body: JSON.stringify(data),
        });
        return handleResponse(response, dispatch);
      },
    },
    attendance: {
      get: async (accessToken: any, dispatch: Function) => {
        const response = await fetch(`${API_BASE_URL}/coo/attendance`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include", // Include cookies in the request
        });
        return handleResponse(response, dispatch);
      },
    },
    goals: {
      company: async (accessToken: any, dispatch: Function) => {
        const response = await fetch(`${API_BASE_URL}/coo/goals/company`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include", // Include cookies in the request
        });
        return handleResponse(response, dispatch);
      },
      department: async (department: string, accessToken: any, dispatch: Function) => {
        const response = await fetch(
          `${API_BASE_URL}/coo/goals/department?department=${department}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include", // Include cookies in the request
          }
        );
        return handleResponse(response, dispatch);
      },
      createDepartmentGoal: async (data: any, accessToken: any, dispatch: Function) => {
        const response = await fetch(`${API_BASE_URL}/coo/goals/department`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include", // Include cookies in the request
          body: JSON.stringify(data),
        });
        return handleResponse(response, dispatch);
      },
      updateDepartmentGoal: async (goalId: any, goal: any, accessToken: any, dispatch: Function) => {
        const response = await fetch(
          `${API_BASE_URL}/coo/goals/updateDepartmentGoal/${goalId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include", // Include cookies in the request
            body: JSON.stringify(goal), // Send the goal object as JSON in the body
          }
        );

        // Check for successful response
        return handleResponse(response, dispatch);
      },
      deleteDepartmentGoal: async (goalId: any, accessToken: any, dispatch: Function) => {
        const response = await fetch(
          `${API_BASE_URL}/coo/goals/deleteDepartmentGoal/${goalId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include", // Include cookies in the request
          }
        );
        return handleResponse(response, dispatch);
      },
    },
    reports: {
      get: async (accessToken: any, dispatch: Function) => {
        const response = await fetch(`${API_BASE_URL}/coo/reports`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include", // Include cookies in the request
        });
        return handleResponse(response, dispatch);
      },
      upload: async (data: any, accessToken: any, dispatch: Function) => {
        const response = await fetch(`${API_BASE_URL}/coo/reports`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include", // Include cookies in the request
          body: JSON.stringify(data),
        });
        return handleResponse(response, dispatch);
      },
    },
    calendar: {
      get: async (accessToken: any, dispatch: Function) => {
        const response = await fetch(`${API_BASE_URL}/coo/calendar`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include", // Include cookies in the request
        });
        return handleResponse(response, dispatch);
      },
      create: async (data: any, accessToken: any, dispatch: Function) => {
        const response = await fetch(`${API_BASE_URL}/coo/calendar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include", // Include cookies in the request
          body: JSON.stringify(data),
        });
        return handleResponse(response, dispatch);
      },
    },
    documents: {
      get: async (accessToken: any, dispatch: Function) => {
        const response = await fetch(`${API_BASE_URL}/coo/documents`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include", // Include cookies in the request
        });
        return handleResponse(response, dispatch);
      },
    },
    tutorials: {
      get: async (accessToken: any, dispatch: Function) => {
        const response = await fetch(`${API_BASE_URL}/coo/tutorials`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include", // Include cookies in the request
        });
        return handleResponse(response, dispatch);
      },
      updateWatchStatus: async (id: string, isWatched: boolean, accessToken: any, dispatch: Function) => {
        const response = await fetch(`${API_BASE_URL}/coo/tutorials/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include", // Include cookies in the request
          body: JSON.stringify({ is_watched: isWatched }),
        });
        return handleResponse(response, dispatch);
      },
    },
    teamMembers: {
      get: async (accessToken: any, dispatch: Function) => {
        const response = await fetch(`${API_BASE_URL}/coo/team-members`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include", // Include cookies in the request
        });
        return handleResponse(response, dispatch);
      },
    },
  },
  auth: {
    login: {
      verify: async (email: string, password: string) => {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/login`,
            {
              email,
              password,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
              withCredentials: true,
            }
          );
          console.log("Login successful:", response.data);
          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(
              "Login failed:",
              error.response?.data || error.message
            );
          }
        }
      },
    },
    authCheck: {
      get: async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/auth/authCheck`, {
            withCredentials: true,
          });
          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(
              "Auth check failed:",
              error.response?.data || error.message
            );
          }
        }
      },
    },
    logout:{
      post: async (accessToken: any) =>{
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            withCredentials: true,
          });
          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(
              "Logout failed:",
              error.response?.data || error.message
            );
          }
        }
      }
    }
  },
  attendance:{
    StartBreak:{
      post: async (accessToken: any, dispatch: Function) =>{
        try {
          const response = await fetch(`${API_BASE_URL}/attendance/start-break`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`
            },
            credentials: "include"
          });
          return handleResponse(response, dispatch)
        } catch (error) {
          console.log(error)
        }
      }
    },
    EndBreak:{
      post: async (accessToken: any, dispatch: Function, break_id: any) =>{
        try {
          const response = await fetch(`${API_BASE_URL}/attendance/end-break/${break_id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`
            },
            credentials: "include"
          });
          return handleResponse(response, dispatch)
        } catch (error) {
          console.log(error)
        }
      }
    },
  }
};
