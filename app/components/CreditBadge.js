// app/components/CreditBadge.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CreditBadge({ credits }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{credits ?? 0} credits</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#ffe9b3', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  text: { fontWeight: '600' },
});
