import React, { useCallback } from 'react';
import { Pressable, PressableProps } from 'react-native';
import * as Haptics from 'expo-haptics';

type HapticType = 'light' | 'medium' | 'heavy' | 'selection';

interface HapticButtonProps extends Omit<PressableProps, 'onPress'> {
  onPress?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  hapticType?: HapticType;
}

const hapticMap: Record<HapticType, () => Promise<void>> = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  selection: () => Haptics.selectionAsync(),
};

export function HapticButton({
  onPress,
  children,
  className = '',
  disabled = false,
  hapticType = 'light',
  ...rest
}: HapticButtonProps) {
  const handlePress = useCallback(() => {
    if (disabled) return;
    hapticMap[hapticType]().catch(() => {
      // Haptics may not be available on all devices/simulators
    });
    onPress?.();
  }, [disabled, hapticType, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={`${className} ${disabled ? 'opacity-50' : 'active:opacity-70'}`}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
