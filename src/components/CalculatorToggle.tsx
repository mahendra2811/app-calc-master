import React from 'react';
import { View, Text, Switch, Platform } from 'react-native';

interface CalculatorToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  leftLabel?: string;
  rightLabel?: string;
}

export function CalculatorToggle({
  label,
  value,
  onValueChange,
  leftLabel,
  rightLabel,
}: CalculatorToggleProps) {
  return (
    <View>
      {/* Main Label */}
      <Text className="mb-2 text-sm font-medium text-text-secondary">
        {label}
      </Text>

      {/* Toggle Row */}
      <View className="flex-row items-center justify-between rounded-input border border-border bg-surface px-4 py-3">
        <View className="flex-1 flex-row items-center">
          {leftLabel && (
            <Text
              className={`text-sm ${
                !value ? 'font-semibold text-text' : 'text-text-tertiary'
              }`}
            >
              {leftLabel}
            </Text>
          )}
        </View>

        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{
            false: Platform.OS === 'android' ? '#E5E7EB' : '#E5E7EB',
            true: '#0D9488',
          }}
          thumbColor={Platform.OS === 'android' ? (value ? '#FFFFFF' : '#F3F4F6') : undefined}
          ios_backgroundColor="#E5E7EB"
        />

        <View className="flex-1 flex-row items-center justify-end">
          {rightLabel && (
            <Text
              className={`text-sm ${
                value ? 'font-semibold text-text' : 'text-text-tertiary'
              }`}
            >
              {rightLabel}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
