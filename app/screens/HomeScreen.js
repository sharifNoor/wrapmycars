// app/screens/HomeScreen.js
import React, { useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import Button from '../components/Button';
import CreditBadge from '../components/CreditBadge';

export default function HomeScreen({ navigation }) {
  const { user, credits, updateCredits, logout } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      updateCredits();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await updateCredits();
    setRefreshing(false);
  };

  const menu = [
    { key: 'generate', label: 'Generate Wrap', screen: 'Generate' },
    { key: 'credits', label: 'My Credits', screen: 'Credits' },
    { key: 'billing', label: 'Buy Credits', screen: 'Billing' },
    { key: 'settings', label: 'Settings', screen: 'Settings' },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate(item.screen)}>
      <Text style={styles.cardText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome{user?.name ? `, ${user.name}` : ''} 👋</Text>
          <Text style={styles.sub}>Create stunning AI-generated car wraps</Text>
        </View>

        <View style={styles.rightCol}>
          <CreditBadge credits={credits} />
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Menu */}
      <FlatList
        data={menu}
        keyExtractor={(i) => i.key}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={() => (
          <View style={styles.quickActions}>
            <Button title="Generate now" onPress={() => navigation.navigate('Generate')} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcome: { fontSize: 20, fontWeight: '700' },
  sub: { color: '#666', marginTop: 4, fontSize: 13 },
  rightCol: { alignItems: 'flex-end' },
  logoutBtn: { marginTop: 10 },
  logoutText: { color: '#ff4747', fontWeight: '600' },
  quickActions: { marginVertical: 12 },
  card: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fafafa',
  },
  cardText: { fontSize: 16, fontWeight: '600' },
});
