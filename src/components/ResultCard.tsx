import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type ResultType = 'primary' | 'success' | 'error';

interface ResultCardProps {
  title: string;
  value: string;
  subtitle?: string;
  type?: ResultType;
  visible: boolean;
}

const typeStyles: Record<ResultType, { border: string; text: string; bg: string }> = {
  primary: {
    border: 'border-primary',
    text: 'text-primary',
    bg: 'bg-primary/5',
  },
  success: {
    border: 'border-success',
    text: 'text-success',
    bg: 'bg-success/5',
  },
  error: {
    border: 'border-error',
    text: 'text-error',
    bg: 'bg-error/5',
  },
};

export function ResultCard({
  title,
  value,
  subtitle,
  type = 'primary',
  visible,
}: ResultCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(12, { duration: 200 });
    }
  }, [visible, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const styles = typeStyles[type];

  if (!visible && opacity.value === 0) return null;

  return (
    <Animated.View
      style={animatedStyle}
      className={`rounded-card border ${styles.border} ${styles.bg} p-5`}
    >
      {/* Title */}
      <Text className="text-sm font-medium text-text-secondary">
        {title}
      </Text>

      {/* Value */}
      <Text className={`mt-2 text-3xl font-bold ${styles.text}`}>
        {value}
      </Text>

      {/* Subtitle */}
      {subtitle && (
        <Text className="mt-1 text-sm text-text-tertiary">
          {subtitle}
        </Text>
      )}
    </Animated.View>
  );
}
