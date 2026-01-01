// app/components/ImagePreview.js
import React from 'react';
import { Image, View, StyleSheet } from 'react-native';

import { theme } from '../constants/theme';

export default function ImagePreview({ uri, style }) {
  if (!uri) return null;
  return (
    <View style={[styles.wrap, style]}>
      <Image source={{ uri }} style={styles.img} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', height: 250, backgroundColor: theme.colors.cardBackground, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border },
  img: { width: '100%', height: '100%' },
});
