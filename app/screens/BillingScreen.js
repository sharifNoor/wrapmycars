// app/screens/BillingScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { AuthContext } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import api from '../api/api';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useStripe } from '@stripe/stripe-react-native';

import { theme } from '../constants/theme';
import { analyticsService } from '../utils/AnalyticsService';

export default function BillingScreen({ navigation }) {
  const { credits, updateCredits } = useContext(AuthContext);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();


  const buyCredits = async () => {
    setLoading(true);
    try {
      // 1. Fetch Payment Intent & Ephemeral Key from Backend
      console.log('Requesting payment sheet setup...');
      const res = await api.post('/billing/mobile-checkout', {
        // priceId: 'price_1SjVqBE0yTvNMAdBdajdKzo1'  // Live
        priceId: 'price_1SjWSBCVl0h0gHG1cgoxOkQd'  // Test
      });

      console.log('Backend response:', res.data);
      const { paymentIntent, ephemeralKey, customer, publishableKey } = res.data;

      // 2. Initialize Payment Sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'WrapMyCars',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        // Apple Pay / Google Pay defaults enabled
        userInterfaceStyle: 'dark',
        appearance: {
          colors: {
            primary: theme.colors.primary,
            background: '#1c1c1c', // Stripe specific, keep dark
            componentBackground: '#2c2c2c',
            componentBorder: theme.colors.border,
            componentDivider: '#555555',
            primaryText: '#ffffff',
            secondaryText: theme.colors.textDim,
            componentText: '#ffffff',
            placeholderText: '#888888',
          },
        },
      });

      if (initError) {
        console.log(initError);
        showAlert({ type: 'error', title: 'Error', message: initError.message });
        setLoading(false);
        return;
      }

      // 3. Present Payment Sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code !== 'Canceled') {
          showAlert({ type: 'error', title: 'Error', message: paymentError.message });
        }
      } else {
        // Success - Stripe automatically saves the payment method to the customer
        await analyticsService.logPurchase(9.99);
        showAlert({ type: 'success', title: 'Success', message: 'Credits purchased successfully!' });
        await updateCredits();
      }

    } catch (err) {
      console.error('Payment Error Details:', {
        message: err.message,
        status: err?.response?.status,
        data: err?.response?.data,
        config: {
          url: err?.config?.url,
          method: err?.config?.method,
          headers: err?.config?.headers
        }
      });

      const errorMessage = err?.response?.data?.message
        || err?.response?.data?.error
        || err.message
        || 'Payment initialization failed';

      showAlert({
        type: 'error',
        title: 'Payment Error',
        message: `Status: ${err?.response?.status || 'Unknown'}\n${errorMessage}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={theme.gradients.midnight} style={styles.background}>
      <SafeAreaView style={styles.safeArea}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Store</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* Balance Card */}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Your Balance</Text>
            <View style={styles.balanceRow}>
              <Ionicons name="flash" size={32} color="#FFD700" />
              <Text style={styles.balanceValue}>{credits ?? 0}</Text>
            </View>
            <Text style={styles.balanceSub}>Credits available for generation</Text>
          </View>


          <Text style={styles.sectionTitle}>Available Packages</Text>

          {/* Package Card */}
          <TouchableOpacity
            style={styles.packageCard}
            onPress={buyCredits}
            disabled={loading}
          >
            <View style={styles.badge}>
              <Text style={styles.badgeText}>BEST VALUE</Text>
            </View>

            <View style={styles.packageContent}>
              <View>
                <Text style={styles.packTitle}>50 Credits</Text>
                <Text style={styles.packDesc}>~50 AI Transformations</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>$9.99</Text>
              </View>
            </View>

            {loading && (
              <Text style={styles.loadingText}>Initializing Payment...</Text>
            )}
          </TouchableOpacity>

          <View style={styles.infoSection}>
            <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.textDim} />
            <Text style={styles.infoText}>
              Secure payment processed by Stripe. Supports Apple Pay, Google Pay, and Cards.
            </Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  safeArea: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, paddingTop: Platform.OS === 'android' ? 40 : 12
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
  backBtn: { padding: 8 },

  scrollContent: { padding: 20 },

  // Balance
  balanceContainer: {
    alignItems: 'center', backgroundColor: theme.colors.cardBackground,
    borderRadius: 20, padding: 24, marginBottom: 32,
    borderWidth: 1, borderColor: theme.colors.border
  },
  balanceLabel: { color: theme.colors.textDim, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  balanceValue: { fontSize: 48, fontWeight: '800', color: theme.colors.text, marginLeft: 8 },
  balanceSub: { color: theme.colors.textDim, fontSize: 14 },

  sectionTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.text, marginBottom: 16 },

  // Package Card
  packageCard: {
    backgroundColor: theme.colors.cardBackground, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: theme.colors.primary,
    marginBottom: 16, position: 'relative', overflow: 'hidden'
  },
  badge: {
    position: 'absolute', top: 0, right: 0, backgroundColor: theme.colors.primary,
    paddingHorizontal: 12, paddingVertical: 4, borderBottomLeftRadius: 16
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  packageContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  packTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
  packDesc: { color: theme.colors.textDim, fontSize: 14 },

  priceContainer: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  price: { color: '#000', fontWeight: '700', fontSize: 16 },

  loadingText: { color: theme.colors.primary, marginTop: 12, fontWeight: '600', textAlign: 'center' },

  infoSection: { flexDirection: 'row', marginTop: 24, paddingHorizontal: 16 },
  infoText: { color: theme.colors.textDim, fontSize: 12, marginLeft: 8, flex: 1, lineHeight: 18 },
});
