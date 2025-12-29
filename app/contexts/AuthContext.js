// app/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { getToken, saveToken, removeToken } from '../utils/storage';
import api from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authLoading, setAuthLoading] = useState(true);
  const [token, setTokenState] = useState(null);
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);

  // 🔥 Helper: update token everywhere
  const setToken = (newToken) => {
    setTokenState(newToken);
    api.setToken(newToken);
  };

  // 🔥 Fetch credits globally
  const fetchCredits = async () => {
    if (!token) return;
    try {
      const res = await api.get('/billing/credits');
      setCredits(res.data?.credits ?? 0);
    } catch (err) {
      console.warn('fetchCredits error', err?.response?.data || err?.message);

      // Handle auto-logout if API flagged unauthorized
      if (err.isUnauthorized) {
        await logout();
      }
    }
  };

  // Auto-load saved token on startup
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const savedToken = await getToken();
        if (savedToken) {
          setToken(savedToken);
          // Optionally fetch user profile
          const profile = await api.get('/auth/me');
          setUser(profile.data.user);
          await fetchCredits(); // fetch credits immediately
        }
      } catch (e) {
        console.warn('Bootstrap failed', e);
      } finally {
        setAuthLoading(false);
      }
    };
    bootstrap();
  }, []);

  // Login flow
  const login = async ({ token: newToken, user: userData }) => {
    await saveToken(newToken);
    setToken(newToken);
    setUser(userData ?? null);

    await fetchCredits(); // load credits after login
  };

  // Logout flow
  const logout = async () => {
    await removeToken();
    setToken(null);
    setUser(null);
    setCredits(null);
  };

  // Expose helper for Stripe & generator to update credits
  const updateCredits = async () => {
    await fetchCredits();
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        credits,
        authLoading,
        login,
        logout,
        updateCredits,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
