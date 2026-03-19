import React from 'react';
import { Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { HapticButton } from './HapticButton';

interface CategoryChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  color?: string;
}

export function CategoryChip({
  label,
  isActive,
  onPress,
  color,
}: CategoryChipProps) {
  const activeClasses = 'bg-primary border-primary';
  const inactiveClasses = 'bg-transparent border-border';

  return (
    <HapticButton
      onPress={onPress}
      hapticType="selection"
      className={`rounded-chip border px-4 py-2 ${
        isActive ? activeClasses : inactiveClasses
      }`}
      style={
        isActive && color
          ? { backgroundColor: color, borderColor: color }
          : undefined
      }
    >
      <Text
        className={`text-sm font-medium ${
          isActive ? 'text-white' : 'text-text-secondary'
        }`}
      >
        {label}
      </Text>
    </HapticButton>
  );
}
