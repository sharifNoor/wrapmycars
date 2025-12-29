// app/navigation/AppStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import GenerateScreen from '../screens/GenerateScreen';
import CreditsScreen from '../screens/CreditsScreen';
import BillingScreen from '../screens/BillingScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Generate" component={GenerateScreen} />
      <Stack.Screen name="Credits" component={CreditsScreen} />
      <Stack.Screen name="Billing" component={BillingScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Privacy" component={require('../screens/PrivacyScreen').default} />
      <Stack.Screen name="About" component={require('../screens/AboutScreen').default} />
      <Stack.Screen name="Contact" component={require('../screens/ContactScreen').default} />
      <Stack.Screen name="UpdatePassword" component={require('../screens/UpdatePasswordScreen').default} />
    </Stack.Navigator>
  );
}
