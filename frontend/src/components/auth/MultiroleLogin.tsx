import React, { useState } from "react";
import { api } from "../../utils/api/Employees/api";
import { useDispatch } from "react-redux";
import { setAccessToken, setRole } from "../../redux/slice/authSlice";
import { useNavigate } from "react-router-dom";

const MultiroleLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Login logic goes here
    // console.log("Logging in with:", email, password);
    try {
      setLoading(true);
      const response = await api.auth.login.verify(email, password)

      console.log(response)

      dispatch(setAccessToken(response.accessToken))
      dispatch(setRole(response.role))

      navigate("/dashboard")

      
    } catch (error) {
      console.error("Login failed:", error);
    }
    finally{
      setLoading(false)
    }
  };

    if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
<div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
  {/* LEFT: Login Form */}
  <div className="flex flex-col justify-center items-center px-10 py-16 bg-white">
    <div className="w-full max-w-md space-y-6">
      <h2 className="text-3xl font-bold text-[#0000CD]">Welcome to D<span className="text-[#D70707]">o</span>tspeaks</h2>
      <p className="text-gray-600">Sign in to manage your role-specific dashboard.</p>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@dotspeaks.com"
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF20A7] outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF20A7] outline-none"
          />
        </div>
        <button
          type="submit"
          onClick={handleLogin}
          className="w-full bg-[#0000CD] text-white py-2 rounded-md hover:bg-[#0000b0] transition"
        >
          Login
        </button>
      </form>

      <p className="text-xs text-gray-400 mt-6">© 2025 DotSpeaks. All rights reserved.</p>
    </div>
  </div>

  {/* RIGHT: Info Panel */}
  <div className="relative hidden lg:flex items-center justify-center">
    {/* Background Image with Overlay */}
<div
  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
  style={{
    backgroundImage:
      "url('https://i0.wp.com/dotspeaks.com/wp-content/uploads/2025/07/Dotspeaks-Images-8.jpg?fit=6000%2C3991&ssl=1')",
  }}
/>
    <div className="absolute inset-0 bg-[#0000CD]/20" />
    <img src="https://i0.wp.com/dotspeaks.com/wp-content/uploads/2025/07/Dotspeaks-logo_bg.png?fit=2560%2C591&ssl=1" className="w-[12rem] absolute top-0 left-0 mt-4 ml-8" alt="" />

    {/* Content */}
    <div className="relative z-10 text-white max-w-[55rem] px-10">
        
      <h2 className="text-4xl font-bold mb-6 leading-snug">
        Empowering Communication & Productivity
      </h2>
      <p className="text-lg font-semibold mb-6 text-blue-100">
        DotSpeaks revolutionizes HR management with intelligent dashboards,
        secure collaboration, and streamlined workflows.
      </p>
      <ul className="text-sm font-semibold text-blue-200 space-y-3 list-disc pl-5">
        <li>Role-based Dashboards for HR, COO, CEO, and Managers</li>
        <li>Secure Meeting Scheduling & Document Management</li>
        <li>Goal Tracking, Reports, and Employee Insights</li>
      </ul>
    </div>
  </div>
</div>

  );
};

export default MultiroleLogin;
