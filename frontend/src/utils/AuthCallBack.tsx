import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { dispatchConnectionStatus } from '../components/roles/Client/ManageAccount';

const AuthCallback = () => {
  const navigate = useNavigate();
  // Ensure your backend URL is also securely available (e.g., in a config file)
  const BACKEND_API_URL = "http://localhost:8080/api/auth/exchange-token"; 
  
  // The APP_ID from your front-end .env
  const APP_ID = import.meta.env.VITE_APP_ID; 

  // --- Utility function to redirect on failure ---
  const handleFailure = (message: any) => {
    // We avoid alert() and pass the error status via navigation state
    console.error("Connection failed:", message);
    navigate('/dashboard', { 
      state: { 
        status: 'failure', 
        message: 'Failed to connect Meta accounts. Please try again.' 
      } 
    });
  };

  useEffect(() => {
    // 1. Check for the token in the URL hash
    const hash = window.location.hash;
    
    if (hash) {
      // Simple utility to parse the hash fragment into an object
      const params = new URLSearchParams(hash.substring(1));
      const shortLivedToken = params.get('access_token');
      // Clear the hash immediately after reading it to prevent loop or token visibility
      window.history.replaceState(null, '', window.location.pathname + window.location.search);

      if (shortLivedToken) {
        // 2. Secure Handover: Send the token to your backend
        console.log("Token captured. Initiating secure exchange with backend.");

        dispatchConnectionStatus('success', 'Instagram connected!', 'ManageCalendar');
        
        // axios.post(BACKEND_API_URL, {
        //   token: shortLivedToken,
        //   appId: APP_ID,
        // })
        // .then(response => {
        //   // 3. Success: Backend stored the long-lived token
        //   console.log("Token exchange complete. Response:", response.data);
          
        //   // Send success status to the dashboard using state

        // })
        // .catch(error => {
        //   // 4. Failure: Use the new handler to navigate to the dashboard with an error status
        //   handleFailure(error.message || "Unknown error during exchange.");
        // });
      } else {
        // If hash exists but token is missing (e.g., user denied permissions)
        dispatchConnectionStatus('failure', 'Failed to connect Instagram', '');
      }
    } else {
      // Handle case where user arrived without a hash (e.g., navigated here directly)
      // Redirect to the login page as this callback route requires a token.
      dispatchConnectionStatus('failure', 'Failed to connect Instagram', '');
    }
  }, [navigate, APP_ID]); // APP_ID added to dependency array for clarity

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center p-8 bg-white shadow-xl rounded-lg">
        <h2 className="text-2xl font-semibold text-indigo-600 animate-pulse">
          Connecting your Meta accounts...
        </h2>
        <p className="mt-4 text-gray-500">
          Please wait while we secure your connection.
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
