// app/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { getToken, saveToken, removeToken } from '../utils/storage';
import api from '../api/api';
import { useAlert } from './AlertContext';
import { analyticsService } from '../utils/AnalyticsService';

import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authLoading, setAuthLoading] = useState(true);
  const [token, setTokenState] = useState(null);
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const { showAlert } = useAlert();

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
        const msg = err.userMessage || 'Your session has expired. Please login again.';
        await logout();
        showAlert({
          type: 'error',
          title: 'Session Expired',
          message: msg,
        });
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
          await analyticsService.setUserId(profile.data.user.id.toString());
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

    if (userData) {
      await analyticsService.setUserId(userData.id.toString());
    }

    await fetchCredits(); // load credits after login
  };

  // Logout flow
  const logout = async () => {
    await removeToken();
    setToken(null);
    setUser(null);
    setCredits(null);
  };

  // Configure Google Sign-In once on mount
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '509902062436-m4etenp2g3llb1f3dceekcaoek6sq7l6.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  const googleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) throw new Error('No ID Token found');

      // Send to YOUR backend
      const res = await api.post('/auth/google', { token: idToken });

      const { token: jwt, user: userData } = res.data;
      await analyticsService.logLogin('google');
      await login({ token: jwt, user: userData });
      return true;

    } catch (error) {
      console.log('Google Sign-In Error:', error);
      if (error.code === 'SIGN_IN_CANCELLED') {
        // user cancelled the login flow
      } else {
        showAlert({
          type: 'error',
          title: 'Error',
          message: 'Google Sign-In failed',
        });
      }
      return false;
    }
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
        googleLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
