import React, { useEffect, useCallback } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

interface AnimatedSplashProps {
  onComplete: () => void;
}

const SYMBOLS = ['+', '\u2212', '\u00D7', '\u00F7', '=', '\u03C0', '\u221A', '%'];
const STAGGER = 80;
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/** Generate a random offscreen position for a symbol */
function randomOffscreen(): { x: number; y: number } {
  const side = Math.floor(Math.random() * 4);
  switch (side) {
    case 0: // top
      return { x: Math.random() * SCREEN_W - SCREEN_W / 2, y: -SCREEN_H / 2 - 50 };
    case 1: // bottom
      return { x: Math.random() * SCREEN_W - SCREEN_W / 2, y: SCREEN_H / 2 + 50 };
    case 2: // left
      return { x: -SCREEN_W / 2 - 50, y: Math.random() * SCREEN_H - SCREEN_H / 2 };
    default: // right
      return { x: SCREEN_W / 2 + 50, y: Math.random() * SCREEN_H - SCREEN_H / 2 };
  }
}

/** Deterministic final positions for symbols arranged in a loose grid */
function finalPosition(index: number): { x: number; y: number } {
  const cols = 4;
  const row = Math.floor(index / cols);
  const col = index % cols;
  const spacingX = 60;
  const spacingY = 60;
  const offsetX = -((cols - 1) * spacingX) / 2;
  const offsetY = -30;
  return {
    x: offsetX + col * spacingX,
    y: offsetY + row * spacingY,
  };
}

function SymbolItem({
  symbol,
  index,
}: {
  symbol: string;
  index: number;
}) {
  const offscreen = randomOffscreen();
  const final = finalPosition(index);

  const translateX = useSharedValue(offscreen.x);
  const translateY = useSharedValue(offscreen.y);
  const symbolScale = useSharedValue(1);
  const symbolOpacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Phase 1: Fly in with spring (staggered)
    translateX.value = withDelay(
      index * STAGGER,
      withSpring(final.x, { damping: 12, stiffness: 100 }),
    );
    translateY.value = withDelay(
      index * STAGGER,
      withSpring(final.y, { damping: 12, stiffness: 100 }),
    );
    symbolOpacity.value = withDelay(
      index * STAGGER,
      withTiming(1, { duration: 200 }),
    );

    // Phase 2: After all fly in (~800ms), scale down, rotate, and fade
    const phase2Delay = SYMBOLS.length * STAGGER + 400;
    symbolScale.value = withDelay(
      phase2Delay,
      withTiming(0.3, { duration: 500, easing: Easing.inOut(Easing.cubic) }),
    );
    symbolOpacity.value = withSequence(
      withDelay(index * STAGGER, withTiming(1, { duration: 200 })),
      withDelay(phase2Delay - index * STAGGER - 200, withTiming(0, { duration: 400 })),
    );
    rotation.value = withDelay(
      phase2Delay,
      withTiming(360, { duration: 500, easing: Easing.inOut(Easing.cubic) }),
    );
    translateX.value = withSequence(
      withDelay(index * STAGGER, withSpring(final.x, { damping: 12, stiffness: 100 })),
      withDelay(phase2Delay - index * STAGGER, withTiming(0, { duration: 500 })),
    );
    translateY.value = withSequence(
      withDelay(index * STAGGER, withSpring(final.y, { damping: 12, stiffness: 100 })),
      withDelay(phase2Delay - index * STAGGER, withTiming(0, { duration: 500 })),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: symbolOpacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: symbolScale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.Text
      style={[
        {
          position: 'absolute',
          fontSize: 36,
          fontWeight: '700',
          color: '#2DD4BF',
        },
        animatedStyle,
      ]}
    >
      {symbol}
    </Animated.Text>
  );
}

export function AnimatedSplash({ onComplete }: AnimatedSplashProps) {
  const titleOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0.8);
  const taglineOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const textDelay = SYMBOLS.length * STAGGER + 900;

    // Phase 3: Title fade in
    titleOpacity.value = withDelay(
      textDelay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }),
    );
    titleScale.value = withDelay(
      textDelay,
      withSpring(1, { damping: 14, stiffness: 100 }),
    );

    // Phase 3b: Tagline fade in with 200ms extra delay
    taglineOpacity.value = withDelay(
      textDelay + 200,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }),
    );

    // Phase 4: Fade out everything, then call onComplete (~2.5s total)
    const fadeOutDelay = textDelay + 800;
    containerOpacity.value = withDelay(
      fadeOutDelay,
      withTiming(0, { duration: 400, easing: Easing.in(Easing.cubic) }),
    );

    // Schedule onComplete
    const timeout = setTimeout(() => {
      handleComplete();
    }, fadeOutDelay + 450);

    return () => clearTimeout(timeout);
  }, []);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ scale: titleScale.value }],
  }));

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View
      style={[styles.container, containerAnimatedStyle]}
    >
      {/* Math symbols */}
      <View style={styles.symbolsContainer}>
        {SYMBOLS.map((symbol, index) => (
          <SymbolItem key={symbol} symbol={symbol} index={index} />
        ))}
      </View>

      {/* Title */}
      <Animated.Text style={[styles.title, titleAnimatedStyle]}>
        CalcMaster
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, taglineAnimatedStyle]}>
        Every calculation, one tap away
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolsContainer: {
    width: 240,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#2DD4BF',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
    letterSpacing: 0.5,
  },
});
