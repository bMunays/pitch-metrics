// ==========================================
// AUTHENTICATION CONTEXT (client/src/context/AuthContext.jsx)
// ==========================================
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// 1. Create the Context (The "Loudspeaker")
export const AuthContext = createContext();

// 2. Create the Provider Component
// This component will wrap our entire app and hold the actual data.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect runs once when the app first loads. 
  // It checks if the user closed the browser yesterday but still has a valid token saved.
  useEffect(() => {
    const savedToken = localStorage.getItem('pitch_metrics_token');
    const savedUser = localStorage.getItem('pitch_metrics_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      // Attach the token to all future Axios requests automatically
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    setLoading(false);
  }, []);

  // The function we will call when the user successfully logs in
  const login = (jwtToken, userData) => {
    // Save to React State
    setToken(jwtToken);
    setUser(userData);
    
    // Save to the browser's hard drive (localStorage) so it survives page refreshes
    localStorage.setItem('pitch_metrics_token', jwtToken);
    localStorage.setItem('pitch_metrics_user', JSON.stringify(userData));
    
    // Attach to Axios
    axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
  };

  // The function to log out
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('pitch_metrics_token');
    localStorage.removeItem('pitch_metrics_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  // The values we are broadcasting to the rest of the app
  const contextValue = {
    user,
    token,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {/* We only render the app once we've finished checking localStorage */}
      {!loading && children} 
    </AuthContext.Provider>
  );
};