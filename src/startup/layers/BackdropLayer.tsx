import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  interpolate,
  type SharedValue,
} from 'react-native-reanimated';
import { STARTUP_COLORS } from '../constants';

const { width: SW, height: SH } = Dimensions.get('window');

interface Props {
  actI: SharedValue<number>;
  actIII: SharedValue<number>;
  actIV: SharedValue<number>;
}

/**
 * Deep cosmic backdrop. Three layered gradients:
 *  1. Base radial-ish vignette (cosmos → cosmosDeep)
 *  2. Indigo→blue logo gradient bleed (Act II onwards)
 *  3. Teal app-identity wash (Act III → IV handoff)
 */
export function BackdropLayer({ actI, actIII, actIV }: Props) {
  const vignetteStyle = useAnimatedStyle(() => ({
    opacity: interpolate(actI.value, [0, 1], [0.4, 1]),
  }));

  const logoBleedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(actIII.value, [0, 0.4, 1], [0.0, 0.55, 0.35]),
  }));

  const tealWashStyle = useAnimatedStyle(() => ({
    opacity: interpolate(actIII.value, [0, 0.6, 1], [0, 0.0, 0.32]),
  }));

  const dissolveStyle = useAnimatedStyle(() => ({
    opacity: interpolate(actIV.value, [0, 1], [0, 1]),
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Base cosmos */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: STARTUP_COLORS.cosmos }]} />

      {/* Soft radial vignette via two stacked gradients */}
      <Animated.View style={[StyleSheet.absoluteFill, vignetteStyle]}>
        <LinearGradient
          colors={[STARTUP_COLORS.cosmosDeep, STARTUP_COLORS.cosmos, STARTUP_COLORS.cosmos]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0.4 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* Indigo → electric blue bleed (logo identity) */}
      <Animated.View style={[styles.bleed, logoBleedStyle]}>
        <LinearGradient
          colors={[
            'rgba(58,43,217,0.0)',
            'rgba(58,43,217,0.35)',
            'rgba(30,95,255,0.18)',
            'rgba(30,95,255,0.0)',
          ]}
          locations={[0, 0.35, 0.7, 1]}
          style={styles.bleed}
          start={{ x: 0.15, y: 0.85 }}
          end={{ x: 0.85, y: 0.15 }}
        />
      </Animated.View>

      {/* Teal app identity wash (handoff) */}
      <Animated.View style={[styles.bleed, tealWashStyle]}>
        <LinearGradient
          colors={[
            'rgba(45,212,191,0.0)',
            'rgba(45,212,191,0.22)',
            'rgba(99,102,241,0.18)',
            'rgba(45,212,191,0.0)',
          ]}
          locations={[0, 0.4, 0.7, 1]}
          style={styles.bleed}
          start={{ x: 0.2, y: 0.2 }}
          end={{ x: 0.8, y: 0.8 }}
        />
      </Animated.View>

      {/* Act IV dissolve — soft brightening just before handoff */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(15,23,42,0.0)' },
          dissolveStyle,
        ]}
      >
        <LinearGradient
          colors={['rgba(17,24,39,0.0)', 'rgba(17,24,39,0.45)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  bleed: {
    position: 'absolute',
    top: -SH * 0.1,
    left: -SW * 0.1,
    right: -SW * 0.1,
    bottom: -SH * 0.1,
  },
});
