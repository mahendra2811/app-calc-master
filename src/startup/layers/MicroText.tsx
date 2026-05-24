import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import { STARTUP_COLORS } from '../constants';

interface Props {
  actII: SharedValue<number>;
  actIII: SharedValue<number>;
  actIV: SharedValue<number>;
}

const STAGES = ['INITIALIZING', 'CALIBRATING', 'READY'];

/**
 * Three-stage status text below the logo. Cross-fades through STAGES during Act III.
 */
export function MicroText({ actII, actIII, actIV }: Props) {
  return (
    <View pointerEvents="none" style={styles.wrap}>
      {STAGES.map((label, i) => (
        <Line key={label} label={label} index={i} actII={actII} actIII={actIII} actIV={actIV} />
      ))}
    </View>
  );
}

function Line({
  label,
  index,
  actII,
  actIII,
  actIV,
}: {
  label: string;
  index: number;
  actII: SharedValue<number>;
  actIII: SharedValue<number>;
  actIV: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    // Map: stage 0 active in actII tail + early actIII, stage 1 mid actIII, stage 2 late actIII
    const slot = index / STAGES.length;
    const slotEnd = (index + 1) / STAGES.length;
    const combined =
      index === 0
        ? interpolate(actII.value, [0.7, 1], [0, 1], Extrapolation.CLAMP)
        : 0;

    const phase = actIII.value;
    let opacity = combined;
    if (phase > slot - 0.1) {
      opacity = interpolate(
        phase,
        [slot - 0.05, slot + 0.1, slotEnd - 0.05, slotEnd + 0.05],
        [combined, 1, 1, 0],
        Extrapolation.CLAMP,
      );
    }
    const fadeOut = interpolate(actIV.value, [0, 0.3], [1, 0], Extrapolation.CLAMP);
    return { opacity: opacity * fadeOut };
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.lineWrap, style]}>
      <Text style={styles.text}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: '18%',
    left: 0,
    right: 0,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: STARTUP_COLORS.microtext,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 6,
  },
});
