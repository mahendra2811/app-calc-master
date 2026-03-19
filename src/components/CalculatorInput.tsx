import React from 'react';
import { View, Text, TextInput, KeyboardTypeOptions } from 'react-native';

interface CalculatorInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  suffix?: string;
  error?: string;
  className?: string;
}

export function CalculatorInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'numeric',
  suffix,
  error,
  className = '',
}: CalculatorInputProps) {
  return (
    <View className={className}>
      {/* Label */}
      <Text className="mb-2 text-sm font-medium text-text-secondary">
        {label}
      </Text>

      {/* Input Container */}
      <View
        className={`flex-row items-center rounded-input border bg-surface px-4 ${
          error ? 'border-error' : 'border-border'
        }`}
      >
        <TextInput
          className="flex-1 py-3 text-base text-text"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType={keyboardType}
          selectionColor="#0D9488"
        />
        {suffix && (
          <Text className="ml-2 text-sm font-medium text-text-tertiary">
            {suffix}
          </Text>
        )}
      </View>

      {/* Error */}
      {error && (
        <Text className="mt-1 text-xs text-error">
          {error}
        </Text>
      )}
    </View>
  );
}
