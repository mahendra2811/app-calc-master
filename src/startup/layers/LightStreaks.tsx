import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { LIGHT_STREAK_COUNT, STARTUP_COLORS } from '../constants';

interface StreakSpec {
  angle: number;
  delay: number;
  length: number;
}

function buildStreaks(): StreakSpec[] {
  const out: StreakSpec[] = [];
  for (let i = 0; i < LIGHT_STREAK_COUNT; i++) {
    out.push({
      angle: (360 / LIGHT_STREAK_COUNT) * i + ((i * 17) % 30),
      delay: (i * 0.18) % 1,
      length: 140 + ((i * 31) % 80),
    });
  }
  return out;
}

interface Props {
  actIII: SharedValue<number>;
  actIV: SharedValue<number>;
}

export function LightStreaks({ actIII, actIV }: Props) {
  const streaks = useMemo(buildStreaks, []);

  return (
    <View pointerEvents="none" style={styles.center}>
      {streaks.map((s, i) => (
        <Streak key={i} spec={s} actIII={actIII} actIV={actIV} />
      ))}
    </View>
  );
}

function Streak({
  spec,
  actIII,
  actIV,
}: {
  spec: StreakSpec;
  actIII: SharedValue<number>;
  actIV: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    // Repeating emit cycle during Act III: each streak emits at its phase offset
    const cycle = (actIII.value * 3 + spec.delay) % 1;
    const emitOpacity = interpolate(
      cycle,
      [0, 0.15, 0.5, 1],
      [0, 0.85, 0.4, 0],
      Extrapolation.CLAMP,
    );
    const emitScale = interpolate(cycle, [0, 0.4, 1], [0.3, 1, 1.4]);

    // Big burst on Act IV
    const burst = interpolate(actIV.value, [0, 0.4, 1], [0, 1, 0]);
    const burstScale = interpolate(actIV.value, [0, 1], [1, 2.2]);

    const opacity = Math.min(1, emitOpacity + burst * 0.9);
    const scale = emitScale * burstScale;

    return {
      opacity,
      transform: [
        { rotate: `${spec.angle}deg` },
        { translateY: -spec.length * 0.5 },
        { scaleY: scale },
        { scaleX: 0.6 + scale * 0.2 },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.streak,
        { height: spec.length, width: 3 },
        style,
      ]}
    >
      <LinearGradient
        colors={[
          'rgba(94,234,212,0)',
          STARTUP_COLORS.appTealGlow,
          'rgba(129,140,248,0.7)',
          'rgba(94,234,212,0)',
        ]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
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
  streak: {
    position: 'absolute',
    borderRadius: 2,
    shadowColor: STARTUP_COLORS.appTealGlow,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
});
