// app/screens/CreditsScreen.js
import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { AuthContext } from '../contexts/AuthContext';
import Button from '../components/Button';

import { theme } from '../constants/theme';

export default function CreditsScreen({ navigation }) {
  const { credits, updateCredits } = useContext(AuthContext);

  useEffect(() => {
    updateCredits();
  }, []);

  return (
    <LinearGradient colors={theme.gradients.midnight} style={styles.background}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Credits</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Available Credits</Text>
            <Text style={styles.credits}>{credits ?? 0}</Text>
            <Text style={styles.sub}>Use credits to generate stunning car wraps.</Text>

            <View style={{ marginTop: 30 }}>
              <Button title="Buy More Credits" onPress={() => navigation.navigate('Billing')} gradientColors={theme.gradients.sunset} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingTop: Platform.OS === 'android' ? 40 : 16
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
  backBtn: { padding: 8 },

  container: { flex: 1, padding: 20, justifyContent: 'center' },
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  title: { fontSize: 18, color: theme.colors.textDim, marginBottom: 10 },
  credits: { fontSize: 80, fontWeight: '800', color: theme.colors.text, marginBottom: 10 },
  sub: { fontSize: 14, color: theme.colors.textDim, textAlign: 'center', marginBottom: 10 },
});
