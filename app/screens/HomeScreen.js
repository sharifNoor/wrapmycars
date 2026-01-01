import React, { useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthContext } from '../contexts/AuthContext';
import CreditBadge from '../components/CreditBadge';
import TransformationCard from '../components/TransformationCard';
import api from '../api/api';

export default function HomeScreen({ navigation }) {
  const { user, credits, updateCredits, logout } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [featuredImages, setFeaturedImages] = useState([]);

  const insets = useSafeAreaInsets();

  const fetchFeaturedImages = async () => {
    try {
      const response = await api.get('/images/featured');
      const data = response.data;

      const mappedImages = [];
      // Combine adjacent items: index i=generated, i+1=original
      for (let i = 0; i < data.length; i += 2) {
        if (i + 1 < data.length) {
          const generatedItem = data[i];
          const originalItem = data[i + 1];

          mappedImages.push({
            id: generatedItem.id.toString(),
            original: originalItem.image_url,
            generated: generatedItem.image_url,
          });
        }
      }
      setFeaturedImages(mappedImages);
    } catch (error) {
      console.log('Error fetching featured images:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      updateCredits();
      fetchFeaturedImages();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([updateCredits(), fetchFeaturedImages()]);
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <TransformationCard item={item} />
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerSubtitle}>Daily Inspiration</Text>
      <Text style={styles.headerTitle}>Discover</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#0f0c29', '#302b63', '#24243e']} // Deep Midnight Purple/Blue
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <View style={styles.logoContainer}>
          <Ionicons name="car-sport" size={24} color="#D4ACFB" />
          <Text style={styles.appName}>WrapMyCars</Text>
        </View>

        <View style={styles.rightCol}>
          <CreditBadge credits={credits} />
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="options" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Feed */}
      <FlatList
        data={featuredImages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        // contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 10 }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#A742EA"
            colors={['#A742EA', '#fff']}
            progressBackgroundColor="#1a1a1a"
          />
        }
        ListEmptyComponent={
          !refreshing && (
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={48} color="rgba(255,255,255,0.3)" />
              <Text style={styles.emptyText}>No featured transformations yet.</Text>
            </View>
          )
        }
      />

      {/* Floating Action Button for Create */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('Generate')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#D4145A', '#FBB03B']} // Sunset / Fire gradient for action
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Ionicons name="sparkles" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  settingsBtn: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  headerContainer: {
    marginBottom: 20,
    marginTop: 20,
  },
  headerSubtitle: {
    color: '#D4ACFB',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 42,
  },

  // FAB
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
    pointerEvents: 'box-none', // Let clicks pass through if not on button
  },
  fab: {
    shadowColor: '#D4145A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 24,
  },
  fabGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
    gap: 16,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
  }
});
