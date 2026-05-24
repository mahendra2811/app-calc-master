import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { BackdropLayer } from './layers/BackdropLayer';
import { ParticleField } from './layers/ParticleField';
import { EnergyRing } from './layers/EnergyRing';
import { LightStreaks } from './layers/LightStreaks';
import { LogoStage } from './layers/LogoStage';
import { MicroText } from './layers/MicroText';
import { useStartupOrchestrator } from './hooks/useStartupOrchestrator';
import { useReducedMotion } from './hooks/useReducedMotion';

interface Props {
  onComplete: () => void;
}

/**
 * Cinematic 4.2s startup sequence — replaces the standard expo-splash-screen.
 * Pure Reanimated worklets — every transform runs on the UI thread.
 */
export function StartupSequence({ onComplete }: Props) {
  const reducedMotion = useReducedMotion();
  const { actI, actII, actIII, actIV } = useStartupOrchestrator(
    onComplete,
    reducedMotion,
  );

  // Hide native splash as soon as Act I has mounted (zero white flash)
  useEffect(() => {
    const t = requestAnimationFrame(() => {
      SplashScreen.hideAsync().catch(() => {});
    });
    return () => cancelAnimationFrame(t);
  }, []);

  // Whole-screen fade-out at the very end so the handoff to home is buttery
  const containerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(actIV.value, [0.7, 1], [1, 0], Extrapolation.CLAMP),
  }));

  if (reducedMotion) {
    return (
      <Animated.View style={[StyleSheet.absoluteFill, styles.container, containerStyle]}>
        <BackdropLayer actI={actI} actIII={actIII} actIV={actIV} />
        <LogoStage actI={actI} actII={actII} actIII={actIII} actIV={actIV} />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.container, containerStyle]}>
      <BackdropLayer actI={actI} actIII={actIII} actIV={actIV} />
      <ParticleField actI={actI} actII={actII} actIII={actIII} actIV={actIV} />
      <LightStreaks actIII={actIII} actIV={actIV} />
      <EnergyRing actII={actII} actIII={actIII} actIV={actIV} />
      <LogoStage actI={actI} actII={actII} actIII={actIII} actIV={actIV} />
      <MicroText actII={actII} actIII={actIII} actIV={actIV} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#05060F',
    overflow: 'hidden',
  },
});

export default StartupSequence;
