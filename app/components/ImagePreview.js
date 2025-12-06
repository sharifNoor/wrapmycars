// app/components/ImagePreview.js
import React from 'react';
import { Image, View, StyleSheet } from 'react-native';

export default function ImagePreview({ uri, style }) {
  if (!uri) return null;
  return (
    <View style={[styles.wrap, style]}>
      <Image source={{ uri }} style={styles.img} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', height: 250, backgroundColor: '#f2f2f2', borderRadius: 8, overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
});
