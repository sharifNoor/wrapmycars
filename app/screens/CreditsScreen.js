// app/screens/CreditsScreen.js
import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { AuthContext } from '../contexts/AuthContext';
import Button from '../components/Button';

export default function CreditsScreen({ navigation }) {
  const { credits, updateCredits } = useContext(AuthContext);

  useEffect(() => {
    updateCredits();
  }, []);

  return (
    <LinearGradient colors={['#1B4CFF', '#8B2EFF']} style={styles.background}>
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
              <Button title="Buy More Credits" onPress={() => navigation.navigate('Billing')} />
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  backBtn: { padding: 8 },

  container: { flex: 1, padding: 20, justifyContent: 'center' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  title: { fontSize: 18, color: 'rgba(255,255,255,0.8)', marginBottom: 10 },
  credits: { fontSize: 80, fontWeight: '800', color: '#fff', marginBottom: 10 },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 10 },
});
