import React from 'react';
import { StyleSheet, View, Image, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  Extrapolation,
  useDerivedValue,
  withRepeat,
  withTiming,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';
import { STARTUP_COLORS } from '../constants';
import { HoloShimmer } from './HoloShimmer';

const { width: SW, height: SH } = Dimensions.get('window');
const LOGO_SIZE = Math.min(SW, SH) * 0.42;

interface Props {
  actI: SharedValue<number>;
  actII: SharedValue<number>;
  actIII: SharedValue<number>;
  actIV: SharedValue<number>;
}

export function LogoStage({ actI, actII, actIII, actIV }: Props) {
  // Continuous breathing scale loop (Act III)
  const breathing = useDerivedValue(() => {
    return withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.cubic) }),
      -1,
      true,
    );
  }, []);

  // Glow halo (color morphs blue → teal during Act III)
  const haloStyle = useAnimatedStyle(() => {
    const appear = interpolate(actI.value, [0.5, 1], [0, 1], Extrapolation.CLAMP);
    const grow = interpolate(actIII.value, [0, 1], [1, 1.18]);
    const breath = 1 + breathing.value * 0.04;
    const shrink = interpolate(actIV.value, [0, 1], [1, 0.3]);
    const fadeOut = interpolate(actIV.value, [0.4, 1], [1, 0], Extrapolation.CLAMP);
    const shadowColor = interpolateColor(
      actIII.value,
      [0, 0.5, 1],
      [STARTUP_COLORS.logoBlue, STARTUP_COLORS.appTealGlow, STARTUP_COLORS.appTealDark],
    );
    return {
      opacity: appear * fadeOut * 0.85,
      shadowColor,
      transform: [{ scale: grow * breath * shrink }],
    };
  });

  // The logo itself — materializes in Act II, breathes in Act III, transitions in Act IV
  const logoStyle = useAnimatedStyle(() => {
    // Act I: tiny pulsing spark
    const sparkScale = interpolate(actI.value, [0, 1], [0.05, 0.2]);
    // Act II: extrude from depth to full size
    const extrudeScale = interpolate(actII.value, [0, 1], [0.2, 1]);
    // Act III: breathing
    const breath = 1 + breathing.value * 0.04;
    // Act IV: shrink toward header-icon target (top-center area)
    const finalScale = interpolate(actIV.value, [0, 1], [1, 0.18]);
    const finalY = interpolate(actIV.value, [0, 1], [0, -SH * 0.36]);

    const phase =
      actII.value < 0.001 ? sparkScale : extrudeScale * breath * finalScale;

    // Subtle 3D rotation during Act II (extrude reveal) and Act III (idle drift)
    const extrudeRotY = interpolate(actII.value, [0, 1], [-35, 0]);
    const idleRotY = interpolate(actIII.value, [0, 0.5, 1], [0, 6, -3]);
    const idleRotX = interpolate(actIII.value, [0, 0.5, 1], [0, -4, 2]);

    const opacity = interpolate(
      actII.value,
      [0, 0.25, 1],
      [0, 0.6, 1],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [
        { perspective: 1200 },
        { translateY: finalY },
        { scale: phase },
        { rotateY: `${extrudeRotY + idleRotY}deg` },
        { rotateX: `${idleRotX}deg` },
        { rotateZ: `${interpolate(actIII.value, [0, 1], [0, 2])}deg` },
      ],
    };
  });

  // Rim light around the squircle
  const rimStyle = useAnimatedStyle(() => {
    const appear = interpolate(actII.value, [0.3, 1], [0, 1], Extrapolation.CLAMP);
    const fadeOut = interpolate(actIV.value, [0.4, 1], [1, 0], Extrapolation.CLAMP);
    return { opacity: appear * fadeOut };
  });

  // Spark (Act I only) — a tiny bright dot before logo materializes
  const sparkStyle = useAnimatedStyle(() => {
    const o = interpolate(actI.value, [0, 0.6, 1], [0, 1, 0.9]);
    const fade = interpolate(actII.value, [0, 0.3], [1, 0], Extrapolation.CLAMP);
    const pulse = 1 + Math.sin(actI.value * Math.PI * 4) * 0.2;
    return {
      opacity: o * fade,
      transform: [{ scale: pulse }],
    };
  });

  return (
    <View pointerEvents="none" style={styles.center}>
      {/* Glow halo behind logo */}
      <Animated.View
        style={[
          styles.halo,
          {
            width: LOGO_SIZE * 1.6,
            height: LOGO_SIZE * 1.6,
            borderRadius: LOGO_SIZE * 0.8,
          },
          haloStyle,
        ]}
      />

      {/* Act I spark */}
      <Animated.View style={[styles.spark, sparkStyle]} />

      {/* The logo itself */}
      <Animated.View style={[styles.logoWrap, logoStyle]}>
        <Image
          source={require('../../../assets/images/calc-logo.png')}
          style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
          resizeMode="contain"
        />

        {/* Holographic shimmer overlay sized to the logo */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: LOGO_SIZE,
            height: LOGO_SIZE,
          }}
        >
          <HoloShimmer size={LOGO_SIZE} actII={actII} actIII={actIII} />
        </View>

        {/* Rim light — soft inner border on the squircle */}
        <Animated.View
          style={[
            styles.rim,
            {
              width: LOGO_SIZE,
              height: LOGO_SIZE,
              borderRadius: LOGO_SIZE * 0.22,
            },
            rimStyle,
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    backgroundColor: 'transparent',
    shadowOpacity: 0.85,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  spark: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: STARTUP_COLORS.logoBlue,
    shadowColor: STARTUP_COLORS.logoBlue,
    shadowOpacity: 1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
  logoWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rim: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
});

export const LOGO_STAGE_SIZE = LOGO_SIZE;
