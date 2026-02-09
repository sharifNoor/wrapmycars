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
import * as RNIap from 'react-native-iap';
import { Platform } from 'react-native';

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
  const [iapProducts, setIapProducts] = useState([]);

  /**
   * Guess Apple SKU if not provided by backend metadata
   */
  const guessAppleProductId = (pkg) => {
    if (pkg.apple_product_id) return pkg.apple_product_id;

    const base = 'com.wrapmycars';
    if (pkg.type === 'recurring') {
      if (pkg.credits > 100) return `${base}.pro_monthly_max`;
      return `${base}.pro_monthly`;
    }
    return `${base}.credits${pkg.credits}_v2`;
  };

  useEffect(() => {
    fetchPackages();
    analyticsService.logViewItem('store_screen');

    return () => {
      if (Platform.OS === 'ios') {
        RNIap.endConnection();
      }
    };
  }, []);

  useEffect(() => {
    let purchaseUpdateSubscription;
    let purchaseErrorSubscription;

    if (Platform.OS === 'ios') {
      purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase) => {
        console.log('🔔 [IAP] Purchase Update Listener Triggered');
        console.log('🔔 [IAP] Purchase Object:', JSON.stringify(purchase, null, 2));

        const receipt = purchase.transactionReceipt;
        console.log('🔔 [IAP] Receipt exists:', !!receipt);
        console.log('🔔 [IAP] Receipt length:', receipt?.length);

        if (receipt) {
          let shouldFinishTransaction = false;
          let isConsumable = true;

          try {
            // Find package to get details
            console.log('🔍 [IAP] Finding matching package for productId:', purchase.productId);
            const pkg = packages.find(p => {
              const pId = p.appleProductId || guessAppleProductId(p);
              return pId === purchase.productId;
            });

            if (pkg) {
              console.log('✅ [IAP] Package found:', pkg.name, 'Credits:', pkg.credits, 'Type:', pkg.type);
              isConsumable = pkg.type !== 'recurring';
            } else {
              console.warn('⚠️ [IAP] No matching package found for productId:', purchase.productId);
            }

            // Verify with backend
            console.log('📤 [IAP] Sending verification request to backend...');
            console.log('📤 [IAP] Endpoint: /billing/apple-verify');
            console.log('📤 [IAP] Receipt preview:', receipt.substring(0, 100) + '...');

            const res = await api.post('/billing/apple-verify', {
              receipt,
              productId: purchase.productId,
              transactionId: purchase.transactionId
            });

            console.log('📥 [IAP] Backend response received:', JSON.stringify(res.data, null, 2));

            if (res.data.success) {
              console.log('✅ [IAP] Backend verification successful!');
              shouldFinishTransaction = true;

              if (pkg) {
                await analyticsService.logPurchase(pkg.amount, purchase.transactionId);
                showAlert({
                  type: 'success',
                  title: 'Success',
                  message: pkg.type === 'recurring' ? 'Subscription activated!' : 'Credits purchased successfully!'
                });
              } else {
                showAlert({ type: 'success', title: 'Success', message: 'Purchase successful!' });
              }

              console.log('🔄 [IAP] Updating credits...');
              await updateCredits();
              console.log('✅ [IAP] Credits updated successfully');

            } else {
              console.error('❌ [IAP] Backend verification failed:', res.data);
              shouldFinishTransaction = true; // Still finish to prevent stuck transactions
              showAlert({
                type: 'error',
                title: 'Verification Failed',
                message: res.data.message || 'Purchase could not be verified.'
              });
            }
          } catch (err) {
            console.error('❌ [IAP] Verification error occurred');
            console.error('❌ [IAP] Error details:', err);
            console.error('❌ [IAP] Error response:', err?.response?.data);
            console.error('❌ [IAP] Error status:', err?.response?.status);
            console.error('❌ [IAP] Error message:', err?.message);

            shouldFinishTransaction = true; // Finish transaction to prevent it from being stuck

            showAlert({
              type: 'error',
              title: 'Payment Error',
              message: err?.response?.data?.message || err?.message || 'Failed to verify purchase with server.'
            });
          } finally {
            // Always finish transaction to prevent stuck purchases
            if (shouldFinishTransaction) {
              try {
                console.log('🏁 [IAP] Finishing transaction...', { isConsumable });
                await RNIap.finishTransaction({ purchase, isConsumable });
                console.log('✅ [IAP] Transaction finished successfully');
              } catch (finishErr) {
                console.error('❌ [IAP] Error finishing transaction:', finishErr);
              }
            }
          }
        } else {
          console.warn('⚠️ [IAP] No receipt found in purchase object');
        }
      });

      purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
        console.warn('purchaseErrorListener', error);
        if (
          error.responseCode === '2' ||
          error.code === 'E_USER_CANCELLED' ||
          error.code === 'user-cancelled'
        ) {
          // User cancelled, silent
        } else {
          showAlert({ type: 'error', title: 'Error', message: error.message });
        }
      });
    }

    return () => {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove();
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
      }
    };
  }, [packages]); // Re-bind when packages load so we can find pkg details

  const initIAP = async (skus) => {
    if (!skus || skus.length === 0) return;
    try {
      await RNIap.initConnection();
      if (Platform.OS === 'ios') {
        try {
          await RNIap.clearTransactionIOS();
        } catch (e) {
          // Ignore if not supported or fails
        }
      }

      // Use fetchProducts with type 'all' to get both products and subscriptions
      const allIapProducts = await RNIap.fetchProducts({ skus, type: 'all' });

      console.log('IAP Products fetched from Apple:', allIapProducts);
      setIapProducts(allIapProducts);

      // Merge Apple data into packages if on iOS
      setPackages(prev => {
        return prev.map(pkg => {
          const guessedSku = guessAppleProductId(pkg);
          const appleProd = allIapProducts.find(ap => {
            const pId = ap.productId || ap.id; // Fallback to id if productId is undefined
            return (
              pId === pkg.apple_product_id ||
              pId === guessedSku ||
              (pkg.type === 'recurring' && pId?.includes('pro')) ||
              (pkg.credits && pId?.includes(pkg.credits.toString()))
            );
          });

          if (appleProd) {
            return {
              ...pkg,
              name: appleProd.title || pkg.name,
              amount: appleProd.localizedPrice || pkg.amount,
              appleProductId: appleProd.productId || appleProd.id
            };
          }
          return pkg;
        });
      });
    } catch (err) {
      console.warn('IAP Init Error:', err);
    }
  };

  const fetchPackages = async () => {
    try {
      setFetchingPackages(true);
      const res = await api.get('/billing/packages');
      console.log('Packages response:', JSON.stringify(res.data));
      setPackages(res.data);

      if (Platform.OS === 'ios') {
        // Collect all SKUs (metadata or guessed)
        const skus = res.data.map(p => guessAppleProductId(p)).filter(id => id);

        if (skus.length > 0) {
          initIAP(skus);
        }
      }
    } catch (err) {
      console.error('Fetch Packages Error:', err);
      showAlert({ type: 'error', title: 'Error', message: 'Failed to fetch packages' });
    } finally {
      setFetchingPackages(false);
    }
  };


  const buyCredits = async (pkg) => {
    setActivePriceId(pkg.price_id);

    // Handle iOS IAP
    if (Platform.OS === 'ios') {
      try {
        console.log('🛒 [IAP] Starting iOS purchase flow');
        console.log('🛒 [IAP] Package:', pkg.name, 'Credits:', pkg.credits, 'Type:', pkg.type);

        await analyticsService.logBeginCheckout(pkg.amount, pkg.name);

        // Find matching IAP product from Apple
        console.log('🔍 [IAP] Searching for Apple product in', iapProducts.length, 'products');
        const appleProduct = iapProducts.find(ap => {
          const pId = ap.productId || ap.id;
          return (
            pId === pkg.appleProductId ||
            pId?.includes(pkg.credits) ||
            (pkg.type === 'recurring' && pId?.includes('pro'))
          );
        });

        if (!appleProduct) {
          console.error('❌ [IAP] No Apple product found for package:', pkg);
          console.error('❌ [IAP] Available products:', iapProducts.map(p => p.productId || p.id));
          showAlert({ type: 'error', title: 'Error', message: 'This package is not configured in the App Store yet.' });
          return;
        }

        const sku = appleProduct.productId || appleProduct.id;
        console.log('✅ [IAP] Apple product found:', sku);
        console.log(`🛒 [IAP] Requesting Purchase for SKU: ${sku} | Type: ${pkg.type}`);
        console.log('🛒 [IAP] Purchase params:', JSON.stringify({
          sku,
          type: pkg.type === 'recurring' ? 'subs' : 'in-app'
        }, null, 2));

        await RNIap.requestPurchase({
          sku,
          request: {
            ios: {
              sku
            }
          },
          type: pkg.type === 'recurring' ? 'subs' : 'in-app'
        });

        console.log('✅ [IAP] Purchase request sent successfully');
        // Verification is now handled by the listener
      } catch (err) {
        console.error('❌ [IAP] Purchase request error:', err);
        console.error('❌ [IAP] Error code:', err.code);
        console.error('❌ [IAP] Error message:', err.message);

        // We only catch immediate request errors here (like invalid SKU parameter)
        // User cancellation often comes here too in some versions, but also listener
        if (err.code !== 'E_USER_CANCELLED') {
          showAlert({ type: 'error', title: 'Error', message: err.message });
        } else {
          console.log('ℹ️ [IAP] User cancelled purchase');
        }
      } finally {
        setActivePriceId(null);
      }
      return;
    }

    // Existing Stripe logic (Android/Rest)
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
        merchantDisplayName: 'Wrap my Cars',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        // Apple Pay / Google Pay defaults enabled
        returnURL: 'wrapmycars',
        applePay: {
          merchantId: 'merchant.com.wrapmycars',
          merchantCountryCode: 'US',
        },
        userInterfaceStyle: 'dark',
        appearance: {
          colors: {
            primary: theme.colors.primary,
            background: '#645151', // Stripe specific, keep dark
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
    // Check if active (can be Stripe Price ID or Apple Product ID)
    const isPackActive = pkg.type === 'recurring' && isSubscribed && currentPlanId && (
      pkg.price_id?.toString() === currentPlanId?.toString() ||
      pkg.appleProductId?.toString() === currentPlanId?.toString() ||
      guessAppleProductId(pkg) === currentPlanId?.toString()
    );


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
            <Text style={styles.packTitle}>{pkg.name}</Text>
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

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Compact Balance & Status Card */}
          <View style={styles.compactStatusCard}>
            <View style={styles.compactBalanceInfo}>
              <Text style={styles.compactLabel}>Balance</Text>
              <View style={styles.compactValueRow}>
                <Ionicons name="flash" size={20} color="#FFD700" />
                <Text style={styles.compactValue}>{credits ?? 0}</Text>
              </View>
            </View>

            <View style={styles.compactDivider} />

            <View style={styles.compactPlanMeta}>
              <Text style={styles.compactLabel}>Status</Text>
              {isSubscribed ? (
                <View style={{ alignItems: 'center' }}>
                  <View style={styles.activeSubscriberTag}>
                    <Ionicons name="checkmark-circle" size={12} color={theme.colors.success} />
                    <Text style={styles.activeSubscriberText}>PRO ACTIVE</Text>
                  </View>
                  {cancelAtPeriodEnd ? (
                    <Text style={styles.cancelTinyText}>Subscription will end at billing period</Text>
                  ) : (
                    <TouchableOpacity style={styles.compactManageBtn} onPress={handleManageSubscription}>
                      <Text style={styles.compactManageBtnText}>Manage</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <Text style={styles.freePlanText}>Free Tier</Text>
              )}
            </View>
          </View>

          {/* Pro Tip Callout (Moved Up) */}
          <LinearGradient
            colors={['rgba(167, 66, 234, 0.15)', 'rgba(167, 66, 234, 0.05)']}
            style={styles.proTipContainer}
          >
            <View style={{ padding: 12, }}>
              <View style={styles.proTipHeader}>
                <Ionicons name="star" size={16} color={theme.colors.primary} />
                <Text style={styles.proTipTitle}>PRO TIP</Text>
              </View>
              <Text style={styles.proTipText}>Subscribers get <Text style={{ fontWeight: '700', color: '#fff' }}>NO WATERMARKS</Text> and monthly credits. Keep your designs clean!</Text>
            </View>
          </LinearGradient>

          {/* Monthly Subscriptions */}
          {subscriptions.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Monthly Subscriptions</Text>
                <View style={styles.hLine} />
              </View>
              {fetchingPackages ? (
                <Text style={styles.loadingText}>Loading...</Text>
              ) : (
                subscriptions.map(renderPackage)
              )}
            </View>
          )}

          {/* One-time Packs */}
          <View style={[styles.sectionContainer, { marginTop: 12 }]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Credit Packs</Text>
              <View style={styles.hLine} />
            </View>
            {fetchingPackages ? (
              <Text style={styles.loadingText}>Loading...</Text>
            ) : (
              creditPacks.map(renderPackage)
            )}
          </View>

          {/* Pro Benefits (Condensed) */}
          <View style={styles.quickBenefitsRow}>
            <View style={styles.benefitIconBox}>
              <Ionicons name="water-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.benefitTinyText}>No Watermark</Text>
            </View>
            <View style={styles.benefitIconBox}>
              <Ionicons name="flash-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.benefitTinyText}>Monthly Credits</Text>
            </View>
            <View style={styles.benefitIconBox}>
              <Ionicons name="infinite-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.benefitTinyText}>Support</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Ionicons name="shield-checkmark-outline" size={16} color={theme.colors.textDim} />
            <Text style={styles.infoText}>
              Secure payment via Stripe. Supports Apple/Google Pay.
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

  scrollContent: { padding: 16 },

  // Compact Status Card
  compactStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
  },
  compactBalanceInfo: { flex: 1, alignItems: 'center' },
  compactPlanMeta: { flex: 1, alignItems: 'center' },
  compactDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' },
  compactLabel: { color: theme.colors.textDim, fontSize: 10, textTransform: 'uppercase', marginBottom: 4, letterSpacing: 0.5 },
  compactValueRow: { flexDirection: 'row', alignItems: 'center' },
  compactValue: { fontSize: 20, fontWeight: '800', color: '#fff', marginLeft: 4 },

  activeSubscriberTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 250, 154, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  activeSubscriberText: { color: theme.colors.success, fontSize: 10, fontWeight: '700', marginLeft: 4 },
  freePlanText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  compactManageBtn: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, backgroundColor: 'rgba(167, 66, 234, 0.1)', borderWidth: 0.5, borderColor: theme.colors.primary },
  compactManageBtnText: { color: theme.colors.primary, fontSize: 8, fontWeight: '700' },
  cancelTinyText: { color: '#FBB03B', fontSize: 8, marginTop: 4, fontWeight: '600' },

  // Pro Tip (Moved Up)
  proTipContainer: {
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(167, 66, 234, 0.3)',
  },
  proTipHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  proTipTitle: { color: theme.colors.primary, fontSize: 12, fontWeight: '900', marginLeft: 6, letterSpacing: 1 },
  proTipText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 18 },

  sectionContainer: { marginBottom: 8 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.text, textTransform: 'uppercase', letterSpacing: 0.5 },
  hLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginLeft: 12 },

  // Package Card
  packageCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 10, position: 'relative', overflow: 'hidden'
  },
  badge: {
    position: 'absolute', top: 0, right: 0, backgroundColor: theme.colors.primary,
    paddingHorizontal: 10, paddingVertical: 2, borderBottomLeftRadius: 10
  },
  badgeText: { color: '#fff', fontSize: 8, fontWeight: '800' },

  packageContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  packTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  packDesc: { color: theme.colors.textDim, fontSize: 12, marginTop: 2 },

  priceContainer: { backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  price: { color: '#000', fontWeight: '800', fontSize: 13 },

  loadingText: { color: theme.colors.primary, marginVertical: 12, fontWeight: '600', textAlign: 'center', fontSize: 12 },

  // Benefits Row
  quickBenefitsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20, paddingVertical: 16, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12 },
  benefitIconBox: { alignItems: 'center' },
  benefitTinyText: { color: theme.colors.textDim, fontSize: 10, marginTop: 4, fontWeight: '500' },

  infoSection: { flexDirection: 'row', marginTop: 16, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  infoText: { color: 'rgba(255,255,255,0.3)', fontSize: 10, marginLeft: 6, textAlign: 'center' },
});
