import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';

interface Props {
  size: number;
  actII: SharedValue<number>;
  actIII: SharedValue<number>;
}

/**
 * Holographic sheen that sweeps across the logo body.
 * Sized exactly to the logo square so it sits as an overlay.
 */
export function HoloShimmer({ size, actII, actIII }: Props) {
  const style = useAnimatedStyle(() => {
    const appear = interpolate(
      actII.value,
      [0.55, 1],
      [0, 1],
      Extrapolation.CLAMP,
    );
    // Sweep across the surface continuously during Act III
    const sweep = interpolate(actIII.value, [0, 1], [-size * 1.2, size * 1.2]);
    return {
      opacity: appear * (0.55 - actIII.value * 0.05),
      transform: [{ translateX: sweep }, { rotate: '20deg' }],
    };
  });

  return (
    <View
      pointerEvents="none"
      style={[styles.mask, { width: size, height: size, borderRadius: size * 0.22 }]}
    >
      <Animated.View style={[styles.sweep, { width: size * 0.6, height: size * 1.6 }, style]}>
        <LinearGradient
          colors={[
            'rgba(255,255,255,0)',
            'rgba(255,255,255,0.18)',
            'rgba(94,234,212,0.22)',
            'rgba(255,255,255,0.18)',
            'rgba(255,255,255,0)',
          ]}
          locations={[0, 0.35, 0.5, 0.65, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  mask: {
    position: 'absolute',
    overflow: 'hidden',
  },
  sweep: {
    position: 'absolute',
    top: '-30%',
  },
});
