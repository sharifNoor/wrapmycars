// app/screens/BillingScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Linking, StyleSheet } from 'react-native';
import api from '../api/api';
import Button from '../components/Button';

export default function BillingScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const createCheckout = async () => {
    setLoading(true);
    try {
      const res = await api.post('/billing/create-checkout-credits', { priceId: 'price_1SaRMJBHWdCdknXALntSQrnZ', successUrl: "http://localhost:3000/success", cancelUrl: "http://localhost:3000/cancel" }); // send priceId or amount per your backend
      const { url } = res.data;
      console.log('Opening checkout URL:', JSON.stringify(res));
      // open Stripe Checkout in browser
      await Linking.openURL(url);
      // after redirect user will return to app using deep link – we'll handle deep link separately
    } catch (err) {
      console.warn(err.response?.data || err.message);
      alert('Failed to open checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buy Credits</Text>
      <Button title={loading ? 'Opening...' : 'Buy 50 credits — $9.99'} onPress={createCheckout} disabled={loading} />
      <Text style={{ marginTop: 14 }}>When the checkout is completed, Stripe will redirect to your configured success URL which should deep link back to the app (e.g., wrapmycars://stripe-success)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
});
