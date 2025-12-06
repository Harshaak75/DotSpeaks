import axios from "axios";
import { setName, setAccessToken, setRole } from "../../../redux/slice/authSlice";

const API_BASE_URL = import.meta.env.VITE_SERVER_URL;
console.log("hiiii", API_BASE_URL);

const handleResponse = async (response: Response, dispatch: Function) => {
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Request failed: ${response.status} ${errorBody}`);
  }

  const newAccessToken = response.headers.get("x-new-access-token");
  const newRole = response.headers.get("x-user-role");
  const newName = response.headers.get("x-user-name");

  console.log("api name:", newName);

  // Dispatch actions to update Redux state
  if (newAccessToken) {
    dispatch(setAccessToken(newAccessToken));
  }
  if (newRole) {
    dispatch(setRole(newRole));
  }
  if(newName){
    dispatch(setName(newName));
  }
  return response.json();
};

export const api = {
  // COO API endpoints
  ceo: {
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
    setTargets: {
      post: async (
        accessToken: any,
        dispatch: Function,
        targets: any,
        totalRevenue: any
      ) => {
        const response = await fetch(`${API_BASE_URL}/ceo/setTarget`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ targets, totalRevenue }),
          credentials: "include", // Include cookies in the request
        });
        return handleResponse(response, dispatch);
      },
    },
  },
  cmo: {
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
    addcmoTargets: {
      post: async (accessToken: any, dispatch: Function, data: any) => {
        const response = await fetch(`${API_BASE_URL}/cmo/addCMOTargets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ data }),
          credentials: "include", // Include cookies in the request
        });
        return handleResponse(response, dispatch);
      },
    },

    getTargets: {
      get: async (accessToken: any, dispatch: Function, quarter: any) => {
        const response = await fetch(
          `${API_BASE_URL}/cmo/sendTarget/${quarter}`,
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
    },

    getCurrentQuarter: {
      get: async (accessToken: any, dispatch: Function) => {
        const response = await fetch(`${API_BASE_URL}/cmo/getQuarter`, {
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

    uploadLeads: {
      post: async (
        accessToken: any,
        dispatch: any,
        quarter: any,
        file: any,
        packages: any
      ) => {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("quarter", quarter);
          formData.append("Package", packages);

          const response = await fetch(`${API_BASE_URL}/cmo/UploadLeads`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
            body: formData,
          });
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log(error);
        }
      },
    },
  },
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
      department: async (
        department: string,
        accessToken: any,
        dispatch: Function
      ) => {
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
      createDepartmentGoal: async (
        data: any,
        accessToken: any,
        dispatch: Function
      ) => {
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
      updateDepartmentGoal: async (
        goalId: any,
        goal: any,
        accessToken: any,
        dispatch: Function
      ) => {
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
      deleteDepartmentGoal: async (
        goalId: any,
        accessToken: any,
        dispatch: Function
      ) => {
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
      updateWatchStatus: async (
        id: string,
        isWatched: boolean,
        accessToken: any,
        dispatch: Function
      ) => {
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
  BrandHead: {
    profile: {
      get: async (accessToken: any, dispatch: Function) => {
        const response = await fetch(`${API_BASE_URL}/BrandHead/profile`, {
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
    team: {
      getEmployee: async (
        accessToken: any,
        dispatch: Function,
        PackageName: string
      ) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/BrandHead/employeesDetails/${PackageName}`,
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
        } catch (error) {
          console.error("Error fetching team members:", error);
        }
      },
      getClient: async (accessToken: any, dispatch: Function) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/BrandHead/clientDetails`,
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
        } catch (error) {
          console.error("Error fetching team members:", error);
        }
      },
      createTeam: async (
        accessToken: any,
        dispatch: Function,
        data: any,
        packageName: any
      ) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/BrandHead/createTeam/${packageName}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: "include", // Include cookies in the request
              body: JSON.stringify({ data }),
            }
          );
          return handleResponse(response, dispatch);
        } catch (error) {
          console.error("Error fetching team members:", error);
        }
      },
      fetchCard: async (accessToken: any, dispatch: Function) => {
        try {
          const response = await fetch(`${API_BASE_URL}/BrandHead/fetchCard`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include", // Include cookies in the request
          });
          return handleResponse(response, dispatch);
        } catch (error) {
          console.error("Error fetching team members:", error);
        }
      },
    },
    getTickets: {
      get: async (accessToken: any, dispatch: Function) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/BrandHead/open-tickets`,
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
        } catch (error) {
          console.error("Error fetching tickets:", error);
        }
      },
    },
    resolveTicket: {
      post: async (
        accessToken: any,
        dispatch: Function,
        ticketId: string,
        response: string
      ) => {
        try {
          const res = await fetch(`${API_BASE_URL}/BrandHead/resolve-ticket`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include", // Include cookies in the request
            body: JSON.stringify({ ticketId, response }),
          });
          return handleResponse(res, dispatch);
        } catch (error) {
          console.error("Error resolving ticket:", error);
        }
      },
    },
    BuildClientAccount: {
      post: async (accessToken: any, dispatch: Function, formData: any) => {
        try {
          const res = await fetch(
            `${API_BASE_URL}/BrandHead/Create-Client-Account`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: "include", // Include cookies in the request
              body: JSON.stringify({ formData }),
            }
          );
          return handleResponse(res, dispatch);
        } catch (error) {
          console.error("Error creating client account:", error);
        }
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
    ClientLogin: {
      verify: async (email: string, password: string) => {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/Clientlogin`,
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
          console.log("Client Login successful:", response.data);
          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(
              "Client Login failed:",
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
    logout: {
      post: async (accessToken: any) => {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/logout`,
            {},
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              withCredentials: true,
            }
          );
          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(
              "Logout failed:",
              error.response?.data || error.message
            );
          }
        }
      },
      client: async (accessToken: any) => {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/Clientlogout`,
            {},
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              withCredentials: true,
            }
          );
          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(
              "Logout failed:",
              error.response?.data || error.message
            );
          }
        }
      },
    },
    resetPassword: {
      post: async (token: string, newPassword: string) => {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/reset-password`,
            {
              // The request body
              token,
              newPassword,
            },
            {
              // Axios config
              withCredentials: true,
            }
          );
          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(
              "Password reset failed:",
              error.response?.data || error.message
            );
            // Re-throw the error so the component can catch it
            throw new Error(
              error.response?.data?.message || "An unknown error occurred."
            );
          }
          // Re-throw for non-Axios errors
          throw error;
        }
      },
    },
  },
  attendance: {
    StartBreak: {
      post: async (accessToken: any, dispatch: Function) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/attendance/start-break`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: "include",
            }
          );
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log(error);
        }
      },
    },
    EndBreak: {
      post: async (accessToken: any, dispatch: Function, break_id: any) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/attendance/end-break/${break_id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: "include",
            }
          );
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log(error);
        }
      },
    },
  },
  brandDeveloper: {
    CreateAccount: {
      post: async (
        accessToken: any,
        dispatch: any,
        email: any,
        password: any,
        companyName: any,
        packages: any,
        leadId: any
      ) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/brandDeveloper/CreateClientAccount`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: "include",
              body: JSON.stringify({
                email,
                password,
                companyName,
                packages,
                leadId,
              }),
            }
          );
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log(error);
        }
      },
    },
    getInfo: {
      get: async (accessToken: any, dispatch: any) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/brandDeveloper/Getinfo`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: "include",
            }
          );
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log(error);
        }
      },
      getTelleCallerPushedClient: async (
        accessToken: any,
        dispatch: any,
        id: string
      ) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/brandDeveloper/GetTellerCallerLeadInfo/${id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: "include",
            }
          );
          return handleResponse(response, dispatch);
        } catch (error) {}
      },
    },
    scheduleMeet: {
      post: async (accessToken: any, dispatch: any, leadId: string) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/brandDeveloper/scheduleMeet/${leadId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: "include",
            }
          );
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log(error);
        }
      },
    },
  },
  TelleCaller: {
    GetInfo: {
      get: async (accessToken: any, dispatch: any) => {
        try {
          const response = await fetch(`${API_BASE_URL}/telleCaller/getInfo`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
          });
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log(error);
        }
      },
    },
    ChangeStatus: {
      post: async (accessToken: any, dispatch: any, id: any, status: any) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/telleCaller/changeStatus/${id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: "include",
              body: JSON.stringify({
                status,
              }),
            }
          );
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log(error);
        }
      },
    },
    SendToBussinessDeveloper: {
      post: async (accessToken: any, dispatch: any, leadId: string) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/telleCaller/SendToBussinessDeveloper/${leadId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: "include",
            }
          );
          return handleResponse(response, dispatch);
        } catch (error) {}
      },
    },
  },
  google: {
    events: {
      get: async (accessToken: any, dispatch: any) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/googleAuth/google/events`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: "include",
            }
          );
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log(error);
        }
      },
    },
  },
  ChattingSystem: {
    myChats: {
      get: async (accessToken: any, dispatch: any) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/chattingSystem/myChats`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: "include",
            }
          );
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log(error);
        }
      },
    },
    myConversations: {
      get: async (accessToken: any, dispatch: any) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/chattingSystem/myConversations`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: "include",
            }
          );
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log(error);
        }
      },
    },
    getMessages: {
      get: async (accessToken: any, dispatch: any, chatId: string) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/chattingSystem/messages/${chatId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: "include",
            }
          );
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log(error);
        }
      },
    },
    storeMessage: {
      post: async (accessToken: any, dispatch: any, messagePayload: any) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/chattingSystem/storeMessage`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: "include",
              body: JSON.stringify(messagePayload),
            }
          );
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log(error);
        }
      },
    },
  },
  ContentWriter: {
    getClientData: {
      get: async (accessToken: any, dispatch: any) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/contentWriter/clients`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: "include",
            }
          );
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log(error);
        }
      },
    },
    uploadDocument: {
      post: async (
        accessToken: any,
        dispatch: any,
        title: any,
        clientId: any,
        file: any,
        selectedDate: any
      ) => {
        try {
          const formData = new FormData();
          formData.append("title", title);
          formData.append("clientId", clientId);
          formData.append("file", file);
          formData.append("selectedDate", selectedDate);

          const response = await fetch(
            `${API_BASE_URL}/contentWriter/uploadDocument`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: "include",
              body: formData,
            }
          );
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log(error);
        }
      },
    },
    UpdateContent: {
      update: async (
        accessToken: any,
        dispatch: any,
        id: string,
        newContent: string
      ) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/contentWriter/updateContent/${id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                newContent,
              }),
              credentials: "include",
            }
          );
          return handleResponse(response, dispatch);
        } catch (error) {}
      },
    },
  },
  Client: {
    getContentData: {
      get: async (accessToken: any, dispatch: any) => {
        try {
          const response = await fetch(`${API_BASE_URL}/client/content`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
          });
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log(error);
        }
      },
    },
    getContentDesignData: {
      get: async (accessToken: any, dispatch: any) => {
        try {
          const response = await fetch(`${API_BASE_URL}/client/contentDesign`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
          });
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log(error);
        }
      },
    },
    getMyClientId: {
      get: async (accessToken: any, dispatch: any) => {
        try {
          const response = await fetch(`${API_BASE_URL}/client/myClientId`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
          });
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log(error);
        }
      },
    },
    getTeamMembers: {
      get: async (accessToken: any, dispatch: any) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/client/GetTeamMembers`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: "include",
            }
          );
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log(error);
        }
      },
    },

    rework: {
      add: async (
        accessToken: any,
        dispatch: any,
        id: string,
        comment: string
      ) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/client/addComment/${id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                comment,
              }),
              credentials: "include",
            }
          );
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log(error);
        }
      },
    },
    approval: {
      put: async (accessToken: any, dispatch: any, id: string) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/client/approval/${id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: "include",
            }
          );
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log(error);
        }
      },
    },
  },
  designer: {
    getContent: {
      get: async (accessToken: any, dispatch: any) => {
        try {
          const response = await fetch(`${API_BASE_URL}/designer/getContent`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
          });
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log(error);
        }
      },
    },
    uploadSubmission: {
      post: async (accessToken: any, dispatch: any, formData: FormData) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/designer/submission/upload`,
            {
              method: "POST",
              headers: {
                // Your auth token
                Authorization: `Bearer ${accessToken}`,
              },
              body: formData,
            }
          );
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log("The error from here: ", error);
        }
      },
    },
    getUserId: {
      get: async (accessToken: any, dispatch: any) => {
        try {
          const response = await fetch(`${API_BASE_URL}/designer/getUserId`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
          });
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log("Error fetching user ID:", error);
        }
      },
    },
    getHelpRequests: {
      post: async (
        accessToken: any,
        dispatch: any,
        message: any,
        taskId: any
      ) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/designer/request-help`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                message,
                taskId,
              }),
              credentials: "include",
            }
          );
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log("Error fetching user ID:", error);
        }
      },
    },
  },
  digitalMarketer: {
    getGraphicDesignerData: {
      get: async (accessToken: any, dispatch: any) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/digitalMarket/getInfoOfGF`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: "include",
            }
          );
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log("Error fetching Graphic Designer data:", error);
        }
      },
    },
    ApproveTheDesign: {
      post: async (accessToken: any, dispatch: any, taskId: string) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/digitalMarket/approval-design`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                taskId,
              }),
              credentials: "include",
            }
          );
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log("Error approving the design:", error);
        }
      },
    },
    RequestRework: {
      post: async (
        accessToken: any,
        dispatch: any,
        taskId: string,
        comment: string
      ) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/digitalMarket/request-rework`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                taskId,
                comment,
              }),
              credentials: "include",
            }
          );
          return handleResponse(response, dispatch);
        } catch (error) {
          console.log("Error approving the design:", error);
        }
      },
    },
  },
};
