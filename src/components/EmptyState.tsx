import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function EmptyState({
  title,
  description,
  icon = 'file-tray-outline',
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Ionicons name={icon} size={64} color="#9CA3AF" />
      <Text className="mt-5 text-center text-lg font-bold text-text-secondary">
        {title}
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-text-tertiary">
        {description}
      </Text>
    </View>
  );
}
