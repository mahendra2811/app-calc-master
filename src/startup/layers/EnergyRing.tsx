import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import { STARTUP_COLORS, ENERGY_RING_COUNT } from '../constants';

interface Props {
  actII: SharedValue<number>;
  actIII: SharedValue<number>;
  actIV: SharedValue<number>;
}

/**
 * Three concentric energy rings orbiting behind the logo.
 * Color morphs from logo-blue to app-teal during Act III (brand → product handoff).
 */
export function EnergyRing({ actII, actIII, actIV }: Props) {
  return (
    <View pointerEvents="none" style={styles.center}>
      {Array.from({ length: ENERGY_RING_COUNT }).map((_, i) => (
        <Ring key={i} index={i} actII={actII} actIII={actIII} actIV={actIV} />
      ))}
    </View>
  );
}

function Ring({
  index,
  actII,
  actIII,
  actIV,
}: {
  index: number;
  actII: SharedValue<number>;
  actIII: SharedValue<number>;
  actIV: SharedValue<number>;
}) {
  const baseSize = 220 + index * 70;
  const direction = index % 2 === 0 ? 1 : -1;

  const style = useAnimatedStyle(() => {
    const appear = interpolate(
      actII.value,
      [0.2 + index * 0.1, 0.8],
      [0, 1],
      Extrapolation.CLAMP,
    );

    const orbit =
      (actII.value * 60 + actIII.value * 180 + actIV.value * 240) * direction;

    const breath = interpolate(actIII.value, [0, 0.5, 1], [1, 1.06, 1]);

    const expand = interpolate(actIV.value, [0, 1], [1, 2.2]);
    const fadeOut = interpolate(actIV.value, [0.4, 1], [1, 0], Extrapolation.CLAMP);

    const ringColor = interpolateColor(
      actIII.value,
      [0, 0.5, 1],
      [STARTUP_COLORS.logoBlue, STARTUP_COLORS.appTealGlow, STARTUP_COLORS.appTealDark],
    );

    return {
      opacity: appear * fadeOut * (0.55 - index * 0.12),
      borderColor: ringColor,
      shadowColor: ringColor,
      transform: [
        { scale: breath * expand },
        { rotate: `${orbit}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          width: baseSize,
          height: baseSize,
          borderRadius: baseSize / 2,
          borderWidth: 1.5,
        },
        style,
      ]}
    >
      {/* Inner glow halo */}
      <View
        style={{
          position: 'absolute',
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          borderRadius: baseSize / 2 + 2,
          borderWidth: 4,
          borderColor: 'rgba(94,234,212,0.04)',
        }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    backgroundColor: 'transparent',
    shadowOpacity: 0.6,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
  },
});
