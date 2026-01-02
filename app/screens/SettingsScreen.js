// app/screens/SettingsScreen.js
import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { AuthContext } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import api from '../api/api';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { theme } from '../constants/theme';
import { analyticsService } from '../utils/AnalyticsService';

export default function SettingsScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    // Optionally load user preferences from backend
    const fetchPrefs = async () => {
      try {
        const res = await api.get('/user/preferences');
        if (res.data) {
          setEmailNotifications(res.data.emailNotifications ?? true);
        }
      } catch (err) {
        // ignore if endpoint missing
      }
    };
    fetchPrefs();
  }, []);

  const toggleEmail = async (val) => {
    setEmailNotifications(val);
    try {
      await api.post('/user/preferences', { emailNotifications: val });
    } catch (err) {
      console.warn('update prefs failed', err?.response?.data || err?.message);
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Unable to update preferences',
      });
      setEmailNotifications((prev) => !prev);
    }
  };

  const handleDeleteAccount = async () => {
    showAlert({
      type: 'confirm',
      title: 'Delete account',
      message: 'Are you sure? This action is irreversible.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            setLoading(true);
            try {
              await api.delete('/auth/account');
              await analyticsService.logEvent('delete_account');
              await logout();
            } catch (err) {
              console.warn('delete account failed', err?.response?.data || err?.message);
              showAlert({
                type: 'error',
                title: 'Error',
                message: 'Account deletion failed',
              });
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    });
  };

  const RenderSection = ({ title, children }) => (
    <View style={styles.sectionContainer}>
      {title && <Text style={styles.sectionHeader}>{title}</Text>}
      <View style={styles.card}>{children}</View>
    </View>
  );

  const RenderRow = ({ icon, label, value, onPress, isLast, rightElement }) => (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.rowBorder]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.rowLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color="#fff" />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {rightElement}
        {onPress && !rightElement && (
          <Ionicons name="chevron-forward" size={20} color="#666" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={theme.gradients.midnight} style={styles.background}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {console.log(user)}
          {/* Account Section */}
          <RenderSection title="Account">
            <RenderRow
              icon="person-outline"
              label="Email"
              value={user?.email || "user@example.com"}
            />
            <RenderRow
              icon="key-outline"
              label="Change Password"
              onPress={() => navigation.navigate('UpdatePassword')}
              isLast
            />
          </RenderSection>

          {/* Preferences Section */}
          <RenderSection title="Preferences">
            <RenderRow
              icon="notifications-outline"
              label="Email Notifications"
              isLast
              rightElement={
                <Switch
                  value={emailNotifications}
                  onValueChange={toggleEmail}
                  trackColor={{ false: '#333', true: '#0b63ff' }}
                  thumbColor={'#fff'}
                />
              }
            />
          </RenderSection>

          {/* Billing Section */}
          <RenderSection title="Billing">
            <RenderRow
              icon="card-outline"
              label="Manage Subscription"
              onPress={() => navigation.navigate('Billing')}
              isLast
            />
          </RenderSection>

          {/* Support & Legal */}
          <RenderSection title="Support & Legal">
            <RenderRow
              icon="lock-closed-outline"
              label="Privacy Policy"
              onPress={() => navigation.navigate('Privacy')}
            />
            <RenderRow
              icon="information-circle-outline"
              label="About Us"
              onPress={() => navigation.navigate('About')}
            />
            <RenderRow
              icon="mail-outline"
              label="Contact Us"
              onPress={() => navigation.navigate('Contact')}
            />
            <RenderRow
              icon="star-outline"
              label="Rate Us"
              onPress={() => Linking.openURL('https://wrapmycars.ai')}
              isLast
            />
          </RenderSection>

          {/* Actions Section */}
          <RenderSection title="Actions">
            <RenderRow
              icon="log-out-outline"
              label="Log Out"
              onPress={logout}
              isLast
            />
          </RenderSection>

          {/* Danger Zone */}
          <View style={[styles.sectionContainer, { marginTop: 20 }]}>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
              <Ionicons name="trash-outline" size={20} color="#ff4747" style={{ marginRight: 8 }} />
              <Text style={styles.deleteText}>Delete Account</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.version}>Version 1.0.0</Text>

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

  sectionContainer: { marginBottom: 24 },
  sectionHeader: {
    fontSize: 14, fontWeight: '600', color: theme.colors.textDim,
    marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1
  },

  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  rowLabel: { fontSize: 16, color: theme.colors.text, fontWeight: '500' },

  rowRight: { flexDirection: 'row', alignItems: 'center' },
  rowValue: { color: theme.colors.textDim, fontSize: 14, marginRight: 8 },

  deleteButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 16, backgroundColor: 'rgba(255, 71, 71, 0.1)',
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 71, 71, 0.3)'
  },
  deleteText: { color: theme.colors.error, fontWeight: '700', fontSize: 16 },

  version: { textAlign: 'center', color: theme.colors.textDim, marginTop: 20 },
});
