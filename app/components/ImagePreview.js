import React, { useState } from 'react';
import { Image, View, StyleSheet, ActivityIndicator } from 'react-native';

import { theme } from '../constants/theme';

export default function ImagePreview({ uri, style }) {
  const [loading, setLoading] = useState(false);

  if (!uri) return null;

  return (
    <View style={[styles.wrap, style]}>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}
      <Image
        source={{ uri }}
        style={styles.img}
        resizeMode="contain"
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', height: 250, backgroundColor: theme.colors.cardBackground, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border },
  img: { width: '100%', height: '100%' },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
});
