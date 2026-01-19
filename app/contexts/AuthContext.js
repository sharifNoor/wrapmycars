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
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState(null);
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
      if (res.data?.hasOwnProperty('is_subscribed')) {
        setIsSubscribed(!!res.data.is_subscribed);
        setCurrentPlanId(res.data.current_plan);
        console.log('🔍 AuthContext - Fetched subscription status:', {
          is_subscribed: res.data.is_subscribed,
          current_plan: res.data.current_plan
        });
      }
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
          setIsSubscribed(!!profile.data.user.is_subscribed);
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
    setIsSubscribed(!!userData?.is_subscribed);

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
    setIsSubscribed(false);
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

      // Try different possible locations for the ID token
      const idToken = userInfo.idToken || userInfo.data?.idToken || userInfo?.user?.idToken;

      console.log('Google Sign-In Response:', {
        hasIdToken: !!idToken,
        userInfoKeys: Object.keys(userInfo),
        dataKeys: userInfo.data ? Object.keys(userInfo.data) : null
      });

      if (!idToken) {
        console.error('Full userInfo object:', JSON.stringify(userInfo, null, 2));
        throw new Error('No ID Token found in Google Sign-In response');
      }

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

    // Also refresh profile to get isSubscribed status
    try {
      const profile = await api.get('/auth/me');
      if (profile.data?.user) {
        setIsSubscribed(!!profile.data.user.is_subscribed);
        setCurrentPlanId(profile.data.user.current_plan);
        setUser(profile.data.user);
      }
    } catch (e) {
      console.warn('Failed to refresh profile in updateCredits', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        credits,
        isSubscribed,
        currentPlanId,
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
