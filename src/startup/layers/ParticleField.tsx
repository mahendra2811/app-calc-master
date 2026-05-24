import React, { useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import { PARTICLE_COUNT, STARTUP_COLORS } from '../constants';

const { width: SW, height: SH } = Dimensions.get('window');

interface ParticleSpec {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  size: number;
  depth: number;
  color: string;
  phaseOffset: number;
}

function pickColor(i: number): string {
  // 60% indigo, 30% teal, 10% amber
  const r = i % 10;
  if (r < 6) return STARTUP_COLORS.particleIndigo;
  if (r < 9) return STARTUP_COLORS.particleTeal;
  return STARTUP_COLORS.particleAmber;
}

function buildParticles(): ParticleSpec[] {
  const out: ParticleSpec[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const depth = 0.3 + ((i * 37) % 70) / 100; // 0.3..1.0
    const sx = (((i * 113) % 100) / 100) * SW;
    const sy = (((i * 197) % 100) / 100) * SH;
    // Drift target — soft, mostly outward
    const angle = ((i * 47) % 360) * (Math.PI / 180);
    const distance = 60 + (((i * 29) % 100) / 100) * 140;
    out.push({
      startX: sx,
      startY: sy,
      endX: sx + Math.cos(angle) * distance * depth,
      endY: sy + Math.sin(angle) * distance * depth,
      size: 1.5 + ((i * 13) % 30) / 10, // 1.5..4.5
      depth,
      color: pickColor(i),
      phaseOffset: ((i * 71) % 100) / 100,
    });
  }
  return out;
}

interface Props {
  actI: SharedValue<number>;
  actII: SharedValue<number>;
  actIII: SharedValue<number>;
  actIV: SharedValue<number>;
}

export function ParticleField({ actI, actII, actIII, actIV }: Props) {
  const particles = useMemo(buildParticles, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <Particle
          key={i}
          spec={p}
          actI={actI}
          actII={actII}
          actIII={actIII}
          actIV={actIV}
        />
      ))}
    </View>
  );
}

function Particle({
  spec,
  actI,
  actII,
  actIII,
  actIV,
}: {
  spec: ParticleSpec;
  actI: SharedValue<number>;
  actII: SharedValue<number>;
  actIII: SharedValue<number>;
  actIV: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    // Fade in during Act I, hold through II/III, dispersion blast on IV
    const driftProgress =
      actI.value * 0.25 + actII.value * 0.25 + actIII.value * 0.5;

    const baseX = interpolate(driftProgress, [0, 1], [spec.startX, spec.endX]);
    const baseY = interpolate(driftProgress, [0, 1], [spec.startY, spec.endY]);

    // Act IV — radial blast outward from center
    const blast = actIV.value;
    const cx = SW / 2;
    const cy = SH / 2;
    const dx = baseX - cx;
    const dy = baseY - cy;
    const blastDist = 1 + blast * (1.8 * spec.depth);
    const finalX = cx + dx * blastDist;
    const finalY = cy + dy * blastDist;

    const fadeIn = interpolate(
      actI.value,
      [0, 0.4 + spec.phaseOffset * 0.3, 1],
      [0, 0.45 * spec.depth, 0.7 * spec.depth],
      Extrapolation.CLAMP,
    );
    const fadeOut = interpolate(actIV.value, [0, 1], [1, 0], Extrapolation.CLAMP);

    // Subtle breathing twinkle in Act III
    const twinkle = interpolate(
      actIII.value,
      [0, 0.5, 1],
      [1, 1.15 + spec.phaseOffset * 0.3, 1],
    );

    return {
      opacity: fadeIn * fadeOut,
      transform: [
        { translateX: finalX },
        { translateY: finalY },
        { scale: twinkle * spec.depth },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: spec.size,
          height: spec.size,
          borderRadius: spec.size / 2,
          backgroundColor: spec.color,
          shadowColor: spec.color,
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
});
