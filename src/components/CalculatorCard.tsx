import React, { useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import type { CalculatorMeta } from '@/types/calculator';

interface CalculatorCardProps {
  calculator: CalculatorMeta;
  onPress?: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const categoryBgMap: Record<string, string> = {
  finance: 'bg-cat-finance/10',
  math: 'bg-cat-math/10',
};

const categoryTextMap: Record<string, string> = {
  finance: 'text-cat-finance',
  math: 'text-cat-math',
};

export function CalculatorCard({
  calculator,
  onPress,
  isFavorite,
  onToggleFavorite,
}: CalculatorCardProps) {
  const router = useRouter();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/calculator/${calculator.id}` as any);
    }
  }, [onPress, router, calculator.id]);

  const catBg = categoryBgMap[calculator.category] ?? 'bg-surface-elevated';
  const catText = categoryTextMap[calculator.category] ?? 'text-text-secondary';

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className="flex-1 rounded-card border border-border bg-surface p-4"
    >
      {/* Top Row: Icon + Favorite */}
      <View className="flex-row items-start justify-between">
        <View
          className={`h-10 w-10 items-center justify-center rounded-lg ${catBg}`}
        >
          <Ionicons
            name={(calculator.icon as any) ?? 'calculator-outline'}
            size={22}
            color={calculator.color}
          />
        </View>

        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            onToggleFavorite();
          }}
          hitSlop={8}
          className="p-1"
        >
          <Ionicons
            name={isFavorite ? 'star' : 'star-outline'}
            size={20}
            color={isFavorite ? '#F59E0B' : '#9CA3AF'}
          />
        </Pressable>
      </View>

      {/* Name */}
      <Text className="mt-3 text-sm font-bold text-text" numberOfLines={1}>
        {calculator.name}
      </Text>

      {/* Description */}
      <Text className="mt-1 text-xs text-text-secondary" numberOfLines={2}>
        {calculator.shortDesc}
      </Text>

      {/* Category Badge */}
      <View className={`mt-3 self-start rounded-chip px-2 py-0.5 ${catBg}`}>
        <Text className={`text-[10px] font-semibold capitalize ${catText}`}>
          {calculator.category}
        </Text>
      </View>
    </AnimatedPressable>
  );
}
