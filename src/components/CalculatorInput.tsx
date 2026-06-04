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

const NUMERIC_KEYBOARD_TYPES: KeyboardTypeOptions[] = [
  'numeric',
  'decimal-pad',
  'number-pad',
  'phone-pad',
];

function filterNumeric(text: string): string {
  // Allow digits, one leading minus, one decimal point
  let filtered = text.replace(/[^0-9.\-]/g, '');
  // Only allow minus at start
  const parts = filtered.split('-');
  filtered = parts[0] === '' ? '-' + (parts[1] ?? '').replace(/-/g, '') : parts.join('').replace(/-/g, '');
  // Only allow one decimal point
  const decParts = filtered.split('.');
  if (decParts.length > 2) {
    filtered = decParts[0] + '.' + decParts.slice(1).join('');
  }
  return filtered;
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
  const isNumeric = NUMERIC_KEYBOARD_TYPES.includes(keyboardType);

  const handleChange = (text: string) => {
    onChangeText(isNumeric ? filterNumeric(text) : text);
  };

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
          onChangeText={handleChange}
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
