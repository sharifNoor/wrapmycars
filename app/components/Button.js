import { StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { theme } from '../constants/theme';
import LinearGradient from 'react-native-linear-gradient';

export default function Button({
  title,
  onPress,
  disabled,
  loading,
  style,
  textStyle,
  gradientColors = theme.gradients.sunset, // New default
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[style, disabled && { opacity: 0.6 }]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.btn}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.txt, textStyle]}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    // soft shadow (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,

    // shadow for Android
    elevation: 6,
  },
  txt: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

// Usage Example in BillingScreen.js:
// import Button from '../components/Button';
// <Button title="Continue" onPress={handleNext} />
// <Button title="Generate Tattoo" loading={isLoading} />
// <Button title="Sign In" disabled />