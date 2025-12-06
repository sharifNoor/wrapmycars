// app/screens/SettingsScreen.js
import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api/api';
import Button from '../components/Button';

export default function SettingsScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Optionally load user preferences from backend
    const fetchPrefs = async () => {
      try {
        const res = await api.get('/user/preferences'); // optional endpoint — adjust if not present
        if (res.data) {
          setEmailNotifications(res.data.emailNotifications ?? true);
        }
      } catch (err) {
        // ignore if endpoint missing; keep defaults
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
      Alert.alert('Error', 'Unable to update preferences');
      setEmailNotifications((prev) => !prev);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert('Delete account', 'Are you sure? This action is irreversible.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await api.delete('/auth/delete'); // backend route optional - implement with caution
            // log out locally
            await logout();
          } catch (err) {
            console.warn('delete account failed', err?.response?.data || err?.message);
            Alert.alert('Error', 'Account deletion failed');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Account</Text>
          <Text style={styles.value}>{user?.email ?? '—'}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Email notifications</Text>
          <Text style={styles.valueSmall}>Receive email updates about credits and offers</Text>
        </View>
        <Switch value={emailNotifications} onValueChange={toggleEmail} />
      </View>

      <View style={{ marginTop: 24 }}>
        <Button title="Manage Billing" onPress={() => navigation.navigate('Billing')} />
      </View>

      <View style={{ marginTop: 12 }}>
        <Button title="Logout" onPress={logout} />
      </View>

      <TouchableOpacity style={styles.danger} onPress={handleDeleteAccount}>
        <Text style={styles.dangerText}>Delete account</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { fontWeight: '600' },
  value: { color: '#333', marginTop: 6 },
  valueSmall: { color: '#666', marginTop: 6, fontSize: 12 },
  danger: { marginTop: 24, alignItems: 'center' },
  dangerText: { color: '#ff4747', fontWeight: '700' },
  version: { marginTop: 36, textAlign: 'center', color: '#999', fontSize: 12 },
});
