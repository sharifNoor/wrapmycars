// app/App.js
import React, { useContext, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './navigation/AuthStack';
import AppStack from './navigation/AppStack';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from './constants/theme';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { AlertProvider } from './contexts/AlertContext';
import { ActivityIndicator, View } from 'react-native';
import { Linking } from 'react-native';
import api from './api/api';
import { StripeProvider } from '@stripe/stripe-react-native';
import { notificationService } from './utils/NotificationService';


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

        // Initialize Notifications
        notificationService.requestUserPermission();
        notificationService.createNotificationListeners();

        return () => {
            sub.remove();
            notificationService.removeListeners();
        };
    }, []);


    if (authLoading) {
        return (
            <LinearGradient
                colors={['#0f0c29', '#302b63', '#24243e']}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
                <ActivityIndicator size="large" color="#D4ACFB" />
            </LinearGradient>
        );
    }

    return token ? <AppStack /> : <AuthStack />;
}

export default function App() {
    return (
        <StripeProvider
            // publishableKey={__DEV__ ? "pk_test_51SjVkcCVl0h0gHG13XKOAXmS3a1B8g5XNjAQYCLghaZDU5WybArYjSrOk4LZy7pQFcDW3nkJQtiDqCFcsrifqIdA00sT8emK69" : "pk_live_51SjVkOE0yTvNMAdBITx03TN0wfLXJKFf2GsCj0x70MwqY6exZ0E6uS7P3tcRlTuvOFatlvLe8NcX3jet1xVxRXdN00dwuPeqwn"}
            publishableKey={"pk_live_51SjVkOE0yTvNMAdBITx03TN0wfLXJKFf2GsCj0x70MwqY6exZ0E6uS7P3tcRlTuvOFatlvLe8NcX3jet1xVxRXdN00dwuPeqwn"}
            merchantIdentifier="merchant.com.wrapmycars" // required for Apple Pay
        >
            <GestureHandlerRootView style={{ flex: 1 }}>
                <AlertProvider>
                    <AuthProvider>
                        <NavigationContainer>
                            <RootNavigator />
                        </NavigationContainer>
                    </AuthProvider>
                </AlertProvider>
            </GestureHandlerRootView>
        </StripeProvider>
    );
}
