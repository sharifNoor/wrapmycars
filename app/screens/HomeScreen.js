// app/screens/HomeScreen.js
import React, { useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { AuthContext } from '../contexts/AuthContext';
import CreditBadge from '../components/CreditBadge';
import TransformationCard from '../components/TransformationCard';

// Mock Data for "Inspiration"
const MOCK_FEED = [
  {
    id: '1',
    title: 'G Wagon',
    subtitle: 'Glossy red paint',
    original: 'https://images.unsplash.com/photo-1552519507-da63767e9975?q=80&w=2670&auto=format&fit=crop',
    generated: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=2574&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'Tesla Model 3',
    subtitle: 'Matte black wrap',
    original: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2671&auto=format&fit=crop',
    generated: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'Porsche 911',
    subtitle: 'Cyberpunk neon style',
    original: 'https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=2670&auto=format&fit=crop',
    generated: 'https://images.unsplash.com/photo-1669915998188-466d6d45db62?q=80&w=2670&auto=format&fit=crop',
  },
];

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

  const renderItem = ({ item }) => (
    <TransformationCard item={item} />
  );

  return (
    <LinearGradient
      colors={['#1B4CFF', '#8B2EFF']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Explore</Text>
        </View>

        <View style={styles.rightCol}>
          <CreditBadge credits={credits} />

          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Feed */}
      <FlatList
        data={MOCK_FEED}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }} // padding for FAB
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={['#fff']}
          />
        }
      />

      {/* Floating Action Button for Create */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Generate')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#fff', '#f0f0f0']}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={32} color="#1B4CFF" />
        </LinearGradient>
      </TouchableOpacity>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20, // status bar space
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
