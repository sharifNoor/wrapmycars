// app/components/Loader.js
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

export default function Loader() {
  const rotation = useSharedValue(0);

  rotation.value = withRepeat(
    withTiming(360, { duration: 1400, easing: Easing.linear }),
    -1,
    false
  );

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.overlay}>
      <BlurView
        blurType="dark"
        blurAmount={15}
        style={styles.blur}
        reducedTransparencyFallbackColor="rgba(0,0,0,0.4)"
      />

      {/* Spinning Gradient Ring */}
      <Animated.View style={[styles.ringContainer, spinStyle]}>
        <LinearGradient
          colors={['#1B4CFF', '#8B2EFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ring}
        />
      </Animated.View>

      {/* Inner Glass Circle */}
      <View style={styles.innerCircle}>
        <BlurView
          blurType="light"
          blurAmount={20}
          style={styles.innerBlur}
          reducedTransparencyFallbackColor="#ffffff15"
        />
      </View>
    </View>
  );
}

const size = 90;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },

  ringContainer: {
    width: size,
    height: size,
    borderRadius: size / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ring: {
    width: size,
    height: size,
    borderRadius: size / 2,
    padding: 10,
    opacity: 0.75,
  },

  innerCircle: {
    position: 'absolute',
    width: size * 0.55,
    height: size * 0.55,
    borderRadius: (size * 0.55) / 2,
    overflow: 'hidden',
  },

  innerBlur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
  },
});
// Usage Example:
// import Loader from '../components/Loader';
// {isLoading && <Loader />}