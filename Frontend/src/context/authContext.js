import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async (retries = 3, delay = 1000) => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await apiClient.get('/users/me'); 
          setUser(data);
        } catch (error) {
          console.error("Failed to load user:", error.message);
          if (error.code === 'ECONNREFUSED' && retries > 0) {
            console.log(`Backend not ready, retrying in ${delay / 1000}s... (${retries} retries left)`);
            setTimeout(() => loadUser(retries - 1, delay), delay);
            return; // Exit this attempt
          }
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await apiClient.post('/users/login', { email, password });
    localStorage.setItem('token', data.token);
    const decoded = JSON.parse(atob(data.token.split('.')[1]));
    setUser(decoded.user);
    return decoded.user; // Return user info
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const authContextValue = { user, loading, login, logout };

  return (
    <AuthContext.Provider value={authContextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};