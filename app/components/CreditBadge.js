import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';

export default function CreditBadge({ credits }) {
  return (
    <LinearGradient
      colors={['#FFD700', '#FFA500']} // Gold to Orange
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="flash" size={12} color="#994f00" />
      </View>
      <Text style={styles.text}>{credits ?? 0}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 18,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    marginLeft: 6,
  },
  text: {
    color: '#5c3a00',
    fontWeight: '800',
    fontSize: 14,
    marginRight: 6,
  },
});
