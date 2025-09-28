// App.tsx
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"; // new component, see below
import DashboardWrapper from "./components/Wrapper/DashboardWrapper";
import MultiroleLogin from "./components/auth/MultiroleLogin";
import { useDispatch, useSelector } from "react-redux";
import { selectAccessToken, selectUserRole } from "./redux/slice/authSlice";
import { AuthCheck } from "./utils/Token/useAuthCheck";
import ClientLogin from "./components/auth/ClientLogin";
import ResetPasswordPage from "./components/auth/ResetPasswordPage";

function App() {
  // const role = localStorage.getItem("role");
  const role = useSelector(selectUserRole);

  const dispatch = useDispatch();

  const accessToken = useSelector(selectAccessToken);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if accessToken and role are available
    const GetToken = async () => {
      try {
        await AuthCheck(dispatch);
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setCheckingAuth(false);
      }
    };
    GetToken();
  }, [dispatch]);

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            accessToken && role ? (
              <Navigate to="/dashboard" />
            ) : (
              <MultiroleLogin />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            role ? (
              <DashboardWrapper userRole={role} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="/ClientLogin" element={<ClientLogin/>} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<div>404 - Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
