// app/App.js
import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './navigation/AuthStack';
import AppStack from './navigation/AppStack';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { Linking } from 'react-native';
import api from './api/api';


function RootNavigator() {
  const { token, authLoading, updateCredits } = useContext(AuthContext);

  const handleUrl = async (event) => {
    const url = event.url;
    if (url.includes('stripe-success')) {
      console.log('Stripe payment success; refreshing credits...');
      await updateCredits();
    }
  };

  useEffect(() => {
    const handleUrl = (event) => {
      const url = event.url;
      // Example: wrapmycars://stripe-success?session_id=...
      if (!url) return;
      if (url.includes('stripe-success')) {
        // call credits refresh endpoint or re-fetch user data
        api.get('/billing/credits').then(res => {
          // dispatch or set credits in context / state
        }).catch(e => console.warn(e));
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    const sub = Linking.addEventListener('url', handleUrl);
    return () => sub.remove();
  }, []);


  if (authLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return token ? <AppStack /> : <AuthStack />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
