// app/components/ImagePreview.js
import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { Ionicons } from '@react-native-vector-icons/ionicons';

export default function ImagePreview({
  uri,
  onBack,
  onDownload,
  onShare,
  onSave,
  onDelete,
  onEdit,
}) {
  if (!uri) return null;

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Image */}
      <Image source={{ uri }} style={styles.image} resizeMode="contain" />

      {/* Back Button (top-left) */}
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <BlurView
          blurType="light"
          blurAmount={20}
          style={styles.iconBlur}
          reducedTransparencyFallbackColor="#ffffff20"
        />
        <Ionicons name="arrow-back" size={24} color="#fff" style={styles.iconAbsolute} />
      </TouchableOpacity>

      {/* Vertical Right-Side Tools */}
      <View style={styles.actionsColumn}>
        <ActionButton icon="download-outline" onPress={onDownload} />
        <ActionButton icon="share-social-outline" onPress={onShare} />
        <ActionButton icon="save-outline" onPress={onSave} />
        <ActionButton icon="trash-outline" onPress={onDelete} />
        <ActionButton icon="create-outline" onPress={onEdit} />
      </View>
    </View>
  );
}

function ActionButton({ icon, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.actionButton}>
      <BlurView
        blurType="dark"
        blurAmount={18}
        style={styles.iconBlur}
        reducedTransparencyFallbackColor="#00000040"
      />
      <Ionicons name={icon} size={22} color="#fff" style={styles.iconAbsolute} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // fullscreen black view
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },

  // Back Button
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 46,
    height: 46,
  },

  actionsColumn: {
    position: 'absolute',
    top: 60,
    right: 20,
    alignItems: 'center',
    gap: 16,
  },

  actionButton: {
    width: 46,
    height: 46,
  },

  iconBlur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
  },
  iconAbsolute: {
    position: 'absolute',
    top: 11,
    left: 11,
  },
});
// Usage Example:
{/* <FullScreenImagePreview
  uri={selectedImage}
  onBack={() => navigation.goBack()}
  onDownload={handleDownload}
  onShare={handleShare}
  onSave={handleSave}
  onDelete={handleDelete}
  onEdit={handleEdit}
/> */}
