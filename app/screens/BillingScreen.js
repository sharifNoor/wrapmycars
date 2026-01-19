// app/screens/BillingScreen.js
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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
  const { credits, updateCredits, isSubscribed, currentPlanId } = useContext(AuthContext);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [activePriceId, setActivePriceId] = useState(null);
  const { showAlert } = useAlert();
  const [packages, setPackages] = useState([]);
  const [fetchingPackages, setFetchingPackages] = useState(true);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);

  useEffect(() => {
    fetchPackages();
    analyticsService.logViewItem('store_screen');
  }, []);

  const fetchPackages = async () => {
    try {
      setFetchingPackages(true);
      const res = await api.get('/billing/packages');
      console.log('Packages response:', JSON.stringify(res.data));
      setPackages(res.data);
    } catch (err) {
      console.error('Fetch Packages Error:', err);
      showAlert({ type: 'error', title: 'Error', message: 'Failed to fetch packages' });
    } finally {
      setFetchingPackages(false);
    }
  };


  const buyCredits = async (pkg) => {
    setActivePriceId(pkg.price_id);
    try {
      // 1. Log Start of Checkout
      await analyticsService.logBeginCheckout(pkg.amount, pkg.name);

      // 2. Fetch Payment Intent & Ephemeral Key from Backend
      console.log('Requesting payment sheet setup for:', pkg.name);
      const res = await api.post('/billing/mobile-checkout', {
        priceId: pkg.price_id
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
            // componentBorder: theme.colors.border,
            componentDivider: '#555555',
            primaryText: '#ffffff',
            // secondaryText: theme.colors.textDim,
            componentText: '#ffffff',
            placeholderText: '#888888',
          },
        },
      });

      if (initError) {
        console.log(initError);
        showAlert({ type: 'error', title: 'Error', message: initError.message });
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
        await analyticsService.logPurchase(pkg.amount, paymentIntent);
        showAlert({ type: 'success', title: 'Success', message: pkg.type === 'recurring' ? 'Subscription activated!' : 'Credits purchased successfully!' });
        await updateCredits();
      }

    } catch (err) {
      console.error('Payment Error Details:', err);
      showAlert({
        type: 'error',
        title: 'Payment Error',
        message: err?.response?.data?.message || 'Payment initialization failed',
      });
    } finally {
      setActivePriceId(null);
    }
  };

  const handleManageSubscription = () => {
    showAlert({
      type: 'confirm',
      title: 'Manage Subscription',
      message: 'Would you like to cancel your subscription? You will keep your PRO benefits until the end of your current billing period.',
      buttons: [
        {
          text: 'Keep Subscription',
          style: 'cancel'
        },
        {
          text: 'Cancel Subscription',
          onPress: cancelSubscription
        }
      ]
    });
  };

  const cancelSubscription = async () => {
    try {
      const res = await api.post('/billing/cancel-subscription');
      setCancelAtPeriodEnd(true); // Mark that subscription will cancel
      showAlert({
        type: 'success',
        title: 'Subscription Canceled',
        message: res.data.message || 'Your subscription has been canceled'
      });
      await updateCredits(); // Refresh subscription status
    } catch (err) {
      console.error('Cancel subscription error:', err);
      showAlert({
        type: 'error',
        title: 'Error',
        message: err?.response?.data?.error || 'Failed to cancel subscription'
      });
    }
  };

  const renderPackage = (pkg) => {
    const isPackActive = pkg.type === 'recurring' && isSubscribed && currentPlanId && pkg.price_id?.toString().trim() === currentPlanId?.toString().trim();
    if (pkg.type === 'recurring') {
      console.log(`Package: ${pkg.name} | PKG_ID: ${pkg.price_id} | USER_PLAN: ${currentPlanId} | MATCH: ${isPackActive}`);
    }
    return (
      <TouchableOpacity
        key={pkg.price_id || pkg.id}
        style={[
          styles.packageCard,
          pkg.is_default && { borderColor: theme.colors.primary },
          isPackActive && { opacity: 0.8, borderColor: theme.colors.success }
        ]}
        onPress={() => buyCredits(pkg)}
        disabled={!!activePriceId || isPackActive}
      >
        {!!pkg.is_default && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>BEST VALUE</Text>
          </View>
        )}
        {isPackActive && (
          <View style={[styles.badge, { backgroundColor: theme.colors.success }]}>
            <Text style={styles.badgeText}>ACTIVE</Text>
          </View>
        )}
        <View style={styles.packageContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.packTitle}>{pkg.credits} {pkg.name}</Text>
            <Text style={styles.packDesc}>
              {pkg.type === 'recurring' ? (
                `Monthly credits + Remove Watermark`
              ) : (
                `~${Math.floor(pkg.credits / 3)} AI Transformations`
              )}
            </Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${pkg.amount}{pkg.type === 'recurring' ? '/mo' : ''}</Text>
          </View>
        </View>

        {activePriceId === pkg.price_id && (
          <Text style={styles.loadingText}>Initializing Payment...</Text>
        )}
      </TouchableOpacity>
    );
  };

  const subscriptions = packages.filter(p => p.type === 'recurring');
  const creditPacks = packages.filter(p => p.type === 'one_time');

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
            {isSubscribed && (
              <>
                <View style={styles.subscribedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                  <Text style={styles.subscribedText}>PRO Subscription Active</Text>
                </View>
                {cancelAtPeriodEnd ? (
                  <View style={styles.cancelWarning}>
                    <Ionicons name="warning-outline" size={16} color="#FBB03B" />
                    <Text style={styles.cancelWarningText}>
                      Subscription will end at billing period
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.manageButton}
                    onPress={handleManageSubscription}
                  >
                    <Ionicons name="settings-outline" size={16} color={theme.colors.primary} />
                    <Text style={styles.manageButtonText}>Manage Subscription</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* Monthly Subscriptions */}
          {subscriptions.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Monthly Subscriptions</Text>
              <Text style={styles.sectionSub}>Get monthly credits and remove all watermarks</Text>
              {fetchingPackages ? (
                <Text style={styles.loadingText}>Loading...</Text>
              ) : (
                subscriptions.map(renderPackage)
              )}
            </>
          )}


          {/* One-time Packs */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>One-time Credit Packs</Text>
          {fetchingPackages ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : (
            creditPacks.map(renderPackage)
          )}

          <View style={styles.subscriptionBenefits}>
            <Text style={styles.benefitTitle}>Pro Benefits</Text>
            <View style={styles.benefitRow}>
              <Ionicons name="water-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.benefitText}>No watermark on downloads & shares</Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="flash-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.benefitText}>Monthly recurring credits</Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="infinite-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.benefitText}>Priority support</Text>
            </View>
          </View>

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
  subscribedBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: 'rgba(76, 175, 80, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  subscribedText: { color: theme.colors.success, fontSize: 12, fontWeight: '600', marginLeft: 4 },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(167, 66, 234, 0.1)',
    borderWidth: 1,
    borderColor: theme.colors.primary
  },
  manageButtonText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4
  },
  cancelWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(251, 176, 59, 0.1)',
    borderWidth: 1,
    borderColor: '#FBB03B'
  },
  cancelWarningText: {
    color: '#FBB03B',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4
  },

  sectionTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.text, marginBottom: 4 },
  sectionSub: { fontSize: 12, color: theme.colors.textDim, marginBottom: 16 },

  // Package Card
  packageCard: {
    backgroundColor: theme.colors.cardBackground, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: theme.colors.border,
    marginBottom: 16, position: 'relative', overflow: 'hidden'
  },
  badge: {
    position: 'absolute', top: 0, right: 0, backgroundColor: theme.colors.primary,
    paddingHorizontal: 12, paddingVertical: 4, borderBottomLeftRadius: 16
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  packageContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  packTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
  packDesc: { color: theme.colors.textDim, fontSize: 14, flex: 1, marginRight: 8 },

  priceContainer: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  price: { color: '#000', fontWeight: '700', fontSize: 14 },

  loadingText: { color: theme.colors.primary, marginTop: 12, fontWeight: '600', textAlign: 'center' },

  subscriptionBenefits: { marginTop: 32, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20 },
  benefitTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 16 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  benefitText: { color: theme.colors.textDim, fontSize: 14, marginLeft: 12 },

  infoSection: { flexDirection: 'row', marginTop: 24, paddingHorizontal: 16 },
  infoText: { color: theme.colors.textDim, fontSize: 12, marginLeft: 8, flex: 1, lineHeight: 18 },
});
